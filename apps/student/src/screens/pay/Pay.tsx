import {
  toOrderPayState,
  type OrderPayState,
} from "@zahln/domain/order/frontend";
import { useCallback, useEffect, useRef, useState, type FC } from "react";
import { useNavigate, useParams } from "react-router";
import { paths, toPaymentPath } from "../../app/paths";
import { isOrderNotFound, usePayerOrder } from "../../data/order";
import { isOrderOutOfDate, toPayFailure, usePayOrder } from "../../data/pay";
import PayJSX, { type PayScreenState } from "./PayJSX";
import type { PayFooterState, PayStatus } from "./payFooter/PayFooter";

const Pay: FC = () => {
  // The route always has the id; the default only satisfies the type.
  const { orderId = "" } = useParams<"orderId">();
  const orderQuery = usePayerOrder(orderId);
  const { refetch } = orderQuery;
  const payMutation = usePayOrder();
  // The order whose countdown has run out. An id rather than a flag, so it
  // can't carry over to another order.
  const [timeUpOrderId, setTimeUpOrderId] = useState<string | null>(null);
  const navigate = useNavigate();
  const headingRef = useRef<HTMLHeadingElement>(null);

  // TalkBack starts reading the new screen at its heading, rather than
  // wherever focus was before the scan.
  useEffect(() => {
    headingRef.current?.focus();
  }, [orderId]);

  // Data before error: a failed check doesn't make a loaded order wrong.
  let state: PayScreenState = { status: "loading" };
  const order = orderQuery.data;
  if (order !== undefined) {
    // While a try is on its way the order stays open on screen: the last
    // try's answer is gone by then, and an order read from before it could
    // still name a payment that was declined.
    const orderPayState: OrderPayState = payMutation.isPending
      ? { status: "open" }
      : toOrderPayState(order, payMutation.data);
    switch (orderPayState.status) {
      case "open":
        state = { status: "open", order };
        break;
      case "ownPayment":
        state = {
          status: "ownPayment",
          paymentPath: toPaymentPath(orderPayState.paymentId),
          paymentStatus: orderPayState.paymentStatus,
        };
        break;
      case "closed":
        state = { status: "closed", orderStatus: orderPayState.orderStatus };
        break;
    }
  } else if (orderQuery.isError) {
    state = isOrderNotFound(orderQuery.error)
      ? { status: "notFound" }
      : { status: "error", isRetrying: orderQuery.isFetching };
  }

  let payStatus: PayStatus = { status: "idle" };
  if (payMutation.isPending) {
    payStatus = { status: "paying" };
  } else if (payMutation.isError) {
    payStatus = {
      status: "failed",
      payFailure: toPayFailure(payMutation.error),
    };
  } else if (
    payMutation.data?.orderId === orderId &&
    payMutation.data.status === "declined"
  ) {
    payStatus = { status: "declined" };
  }

  // Pay shows, disabled, until the order is on screen, and goes once the
  // order can't be paid: the screen then says why.
  let payFooter: PayFooterState | null = null;
  if (state.status === "loading" || state.status === "error") {
    payFooter = { amountCents: null, isPayable: false, payStatus };
  } else if (state.status === "open") {
    payFooter = {
      amountCents: state.order.amountCents,
      // Disabled once the time is up, though the order still reads open
      // until the server says expired: it would only refuse the payment.
      isPayable: timeUpOrderId !== orderId,
      payStatus,
    };
  }

  // Home, in place of this screen: a scanned order is done with once left,
  // so Android's back button shouldn't come back to it. A payment on its way
  // still finishes, and its key is saved for the next try.
  const handleGoHome = (): void => {
    void navigate(paths.home, { replace: true });
  };

  // Pays the amount on screen. Pay is disabled without an open order, so the
  // guard only narrows the type.
  const handlePay = (): void => {
    if (state.status !== "open") return;
    payMutation.mutate(
      { orderId: state.order.id, amountCents: state.order.amountCents },
      {
        // The server knows a newer order: read it, so the screen shows the
        // new price or why it can't be paid.
        onError: (error) => {
          if (isOrderOutOfDate(toPayFailure(error))) void refetch();
        },
      },
    );
  };

  // refetch never rejects: a failure lands in the query's error state.
  const handleRetry = (): void => {
    void refetch();
  };

  // Stable, since the countdown calls it from an effect: a new function each
  // render would ask the server again on every render.
  const handleTimeUp = useCallback((): void => {
    setTimeUpOrderId(orderId);
    void refetch();
  }, [orderId, refetch]);

  return (
    <PayJSX
      headingRef={headingRef}
      payFooter={payFooter}
      state={state}
      handleGoHome={handleGoHome}
      handlePay={handlePay}
      handleRetry={handleRetry}
      handleTimeUp={handleTimeUp}
    />
  );
};

export default Pay;

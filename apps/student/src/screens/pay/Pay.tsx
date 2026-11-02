import {
  toOrderPayState,
  type OrderPayState,
} from "@zahln/domain/order/frontend";
import { newerPayment, type Payment } from "@zahln/domain/payment/frontend";
import { formatCents } from "@zahln/i18n/format";
import { pickLanguage } from "@zahln/i18n/language";
import { useCallback, useEffect, useRef, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { paths, toPaymentPath } from "../../app/paths";
import { isOrderNotFound, usePayerOrder } from "../../data/order";
import { isOrderOutOfDate, toPayFailure, usePayOrder } from "../../data/pay";
import { usePayment } from "../../data/payments";
import type { OwnPaymentStatus } from "./components/ownPayment/OwnPayment";
import type { PayScreenState } from "./content/PayContentJSX";
import type { PayFooterState, PayStatus } from "./footer/payFooter/PayFooter";
import type { RefreshButtonStatus } from "./header/PayHeaderJSX";
import PayJSX from "./PayJSX";

// How long the page asks about a pending payment on its own. Most answers
// come within seconds; one that doesn't can take minutes, and the payer
// shouldn't have to wait on this screen for it.
const PENDING_CHECK_LIMIT_MS = 30_000;

const Pay: FC = () => {
  // The route always has the id; the default only satisfies the type.
  const { orderId = "" } = useParams<"orderId">();
  const orderQuery = usePayerOrder(orderId);
  const { refetch } = orderQuery;
  const { isCheckingPayer, payMutation } = usePayOrder();
  const { t, i18n } = useTranslation("student");
  // i18next only resolves to a supported language. pickLanguage narrows the
  // type to AppLanguage, with English if that ever changes.
  const language = pickLanguage([i18n.resolvedLanguage ?? ""]);
  // The order whose countdown has run out. An id rather than a flag, so it
  // can't carry over to another order.
  const [timeUpOrderId, setTimeUpOrderId] = useState<string | null>(null);
  // The payment the page has stopped asking about, by id like the above.
  const [longPendingPaymentId, setLongPendingPaymentId] = useState<
    string | null
  >(null);
  const navigate = useNavigate();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  // TalkBack starts reading the new screen at its heading, rather than
  // wherever focus was before the scan.
  useEffect(() => {
    headingRef.current?.focus();
  }, [orderId]);

  const order = orderQuery.data;
  // The payment Pay brought back for this order, if any.
  const sentPayment =
    payMutation.data?.orderId === orderId ? payMutation.data : undefined;
  // The payment to follow: the one Pay brought back, or, when the page opened
  // on an order the payer is already paying, the one the order names (only
  // ever the payer's own).
  const followedPaymentId = sentPayment?.id ?? order?.paymentId ?? "";
  const isLongPending = longPendingPaymentId === followedPaymentId;
  const paymentQuery = usePayment(followedPaymentId, {
    isPollingWhilePending: !isLongPending,
  });
  // The later of Pay's answer and the last read: a read can come back older.
  const followedPayment: Payment | undefined =
    sentPayment && paymentQuery.data
      ? newerPayment<Payment>(sentPayment, paymentQuery.data)
      : (paymentQuery.data ?? sentPayment);

  // While a try is on its way the order stays open on screen: the last try's
  // answer is gone by then, and an order read from before it could still name
  // a payment that was declined.
  let orderPayState: OrderPayState | null = null;
  if (order !== undefined) {
    orderPayState = payMutation.isPending
      ? { status: "open" }
      : toOrderPayState(order, followedPayment);
  }

  const pendingPaymentId =
    orderPayState?.status === "ownPayment" &&
    orderPayState.paymentStatus === "pending"
      ? orderPayState.paymentId
      : null;

  // Stops asking 30 seconds after the payment first shows as pending here.
  useEffect(() => {
    if (pendingPaymentId === null) return;
    const timer = setTimeout(
      () => setLongPendingPaymentId(pendingPaymentId),
      PENDING_CHECK_LIMIT_MS,
    );
    return () => clearTimeout(timer);
  }, [pendingPaymentId]);

  // Data before error: a failed check doesn't make a loaded order wrong.
  let state: PayScreenState = { status: "loading" };
  if (order !== undefined && orderPayState !== null) {
    switch (orderPayState.status) {
      case "open":
        state = { status: "open", order };
        break;
      case "ownPayment": {
        const { paymentId, paymentStatus } = orderPayState;
        let ownPaymentStatus: OwnPaymentStatus = paymentStatus;
        if (paymentStatus === "pending" && longPendingPaymentId === paymentId) {
          ownPaymentStatus = "longPending";
        }
        state = {
          status: "ownPayment",
          // Only once the page has stopped asking: its own 2-second checks
          // aren't the payer's Refresh.
          isRefreshing:
            ownPaymentStatus === "longPending" && paymentQuery.isRefetching,
          // Another payment's copy, e.g. a declined one before this, is
          // never shown under this one's result.
          payment: followedPayment?.id === paymentId ? followedPayment : null,
          paymentPath: toPaymentPath(paymentId),
          paymentStatus: ownPaymentStatus,
          tillName:
            paymentQuery.data?.id === paymentId
              ? paymentQuery.data.tillName
              : null,
        };
        break;
      }
      case "closed":
        state = { status: "closed", orderStatus: orderPayState.orderStatus };
        break;
    }
  } else if (orderQuery.isError) {
    state = isOrderNotFound(orderQuery.error)
      ? { status: "notFound" }
      : { status: "error", isRetrying: orderQuery.isFetching };
  }

  const shownResult =
    state.status === "ownPayment" ? state.paymentStatus : null;

  // Refresh only once the page has stopped asking on its own.
  let refreshButtonStatus: RefreshButtonStatus = "hidden";
  if (state.status === "ownPayment" && state.paymentStatus === "longPending") {
    refreshButtonStatus = state.isRefreshing ? "refreshing" : "idle";
  }

  // Focus goes to the result each time it changes, so TalkBack reads
  // "Being checked", then "Paid", as each comes in. Pay's footer is gone by
  // then, and focus with it.
  useEffect(() => {
    if (shownResult !== null) resultHeadingRef.current?.focus();
  }, [shownResult]);

  let payStatus: PayStatus = { status: "idle" };
  if (payMutation.isPending) {
    payStatus = isCheckingPayer
      ? { status: "checkingPayer" }
      : { status: "paying" };
  } else if (payMutation.isError) {
    payStatus = {
      status: "failed",
      payFailure: toPayFailure(payMutation.error),
    };
  } else if (followedPayment?.status === "declined") {
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

  // Pays the amount on screen, once the phone has checked it's the payer.
  // Pay is disabled without an open order, so the guard only narrows the
  // type.
  const handlePay = (): void => {
    if (state.status !== "open") return;
    const { amountCents, id, mensaName } = state.order;
    payMutation.mutate(
      {
        orderId: id,
        amountCents,
        // The amount and the mensa in Android's own dialog, so the payer
        // confirms what they see there, not only what the page said.
        payerCheckPrompt: {
          title: t("pay.payerCheckTitle", {
            amount: formatCents(amountCents, language),
          }),
          description: mensaName,
        },
      },
      {
        // The server knows a newer order: read it, so the screen shows the
        // new price or why it can't be paid.
        onError: (error) => {
          if (isOrderOutOfDate(toPayFailure(error))) void refetch();
        },
      },
    );
  };

  // refetch never rejects: a failure lands in the query's error state, and
  // the payment shown stays as it was.
  const handleRefreshPayment = (): void => {
    void paymentQuery.refetch();
  };

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
      refreshButtonStatus={refreshButtonStatus}
      resultHeadingRef={resultHeadingRef}
      state={state}
      handleGoHome={handleGoHome}
      handlePay={handlePay}
      handleRefreshPayment={handleRefreshPayment}
      handleRetry={handleRetry}
      handleTimeUp={handleTimeUp}
    />
  );
};

export default Pay;

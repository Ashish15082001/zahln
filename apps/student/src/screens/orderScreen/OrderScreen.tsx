import { useCallback, useEffect, useRef, type FC } from "react";
import { useNavigate, useParams } from "react-router";
import { paths, toPaymentPath } from "../../app/paths";
import { isOrderNotFound, usePayerOrder } from "../../data/order";
import type { OrderScreenState } from "./orderContent/OrderContent";
import OrderScreenJSX from "./OrderScreenJSX";

const OrderScreen: FC = () => {
  // The route always has the id; the default only satisfies the type.
  const { orderId = "" } = useParams<"orderId">();
  const orderQuery = usePayerOrder(orderId);
  const { refetch } = orderQuery;
  const navigate = useNavigate();
  const headingRef = useRef<HTMLHeadingElement>(null);

  // TalkBack starts reading the new screen at its heading, rather than
  // wherever focus was before the scan.
  useEffect(() => {
    headingRef.current?.focus();
  }, [orderId]);

  // Data before error: a failed check doesn't make a loaded order wrong.
  let state: OrderScreenState = { status: "loading" };
  const order = orderQuery.data;
  if (order !== undefined) {
    state = {
      status: "ready",
      order,
      paymentPath:
        order.paymentId === null ? null : toPaymentPath(order.paymentId),
    };
  } else if (orderQuery.isError) {
    state = isOrderNotFound(orderQuery.error)
      ? { status: "notFound" }
      : { status: "error", isRetrying: orderQuery.isFetching };
  }

  // Home, in place of this screen: a scanned order is done with once left,
  // so Android's back button shouldn't come back to it.
  const handleBack = (): void => {
    void navigate(paths.home, { replace: true });
  };

  // refetch never rejects: a failure lands in the query's error state.
  const handleRetry = (): void => {
    void refetch();
  };

  // Stable, since the countdown calls it from an effect: a new function each
  // render would ask the server again on every render.
  const handleTimeUp = useCallback((): void => {
    void refetch();
  }, [refetch]);

  return (
    <OrderScreenJSX
      headingRef={headingRef}
      state={state}
      handleBack={handleBack}
      handleRetry={handleRetry}
      handleTimeUp={handleTimeUp}
    />
  );
};

export default OrderScreen;

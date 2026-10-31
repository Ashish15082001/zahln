import type { Order } from "@zahln/domain/order/frontend";
import { useState, type FC } from "react";
import { useOrder } from "../../../../../data/order";
import OrderDialogJSX, { type OrderDialogState } from "./OrderDialogJSX";

/** Where creating the order stands, before there is an order to follow. */
export type OrderCreation = "creating" | "unconfirmed" | "failed";

export interface OrderDialogProps {
  creation: OrderCreation | null;
  /** The order POST /orders gave back, or null before that. */
  order: Order | null;
  handleAcknowledge: () => void;
  handleCancel: () => void;
  handleTryAgain: () => void;
}

const OrderDialog: FC<OrderDialogProps> = ({
  creation,
  order,
  handleAcknowledge,
  handleCancel,
  handleTryAgain,
}) => {
  const orderQuery = useOrder(order);
  const latest = orderQuery.data ?? order;
  // The order whose payment we've seen being checked. `open` after that means
  // the payment was declined: no single reply says so, so it's remembered.
  const [payingSeenFor, setPayingSeenFor] = useState<string | null>(null);
  if (latest?.status === "paying" && payingSeenFor !== latest.id) {
    setPayingSeenFor(latest.id);
  }

  // The last check failed. The dialog keeps the last known state and says
  // it's checking, never a result it doesn't have.
  const hasConnectionProblem = orderQuery.isError;

  let state: OrderDialogState = { status: "closed" };
  if (latest) {
    switch (latest.status) {
      case "open":
        state = {
          status: "open",
          hasConnectionProblem,
          isDeclined: payingSeenFor === latest.id,
          orderId: latest.id,
          qrPayload: latest.qrPayload,
        };
        break;
      case "paying":
        state = {
          status: "paying",
          hasConnectionProblem,
          orderId: latest.id,
          qrPayload: latest.qrPayload,
        };
        break;
      case "paid":
      case "expired":
        state = { status: latest.status };
        break;
    }
  } else if (creation) {
    state = { status: creation };
  }

  return (
    <OrderDialogJSX
      state={state}
      handleAcknowledge={handleAcknowledge}
      handleCancel={handleCancel}
      handleTryAgain={handleTryAgain}
    />
  );
};

export default OrderDialog;

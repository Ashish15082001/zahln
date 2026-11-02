import type { Order } from "@zahln/domain/order/frontend";
import type { TFunction } from "i18next";
import { useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { useOrder } from "../../../../../data/order";
import OrderDialogJSX, {
  type DialogActions,
  type PayableOrder,
} from "./OrderDialogJSX";

/** Where creating the order stands, before there is an order to follow. */
export type OrderCreation = "creating" | "unconfirmed" | "failed";

/** What the dialog shows, from tapping Create order to settled. */
type OrderDialogState =
  | { status: "closed" }
  | { status: "creating" }
  // The reply was lost, so the order may exist. Try again sends the same key.
  | { status: "unconfirmed" }
  // The server didn't make the order. Try again sends a new key.
  | { status: "failed" }
  | {
      status: "open";
      hasConnectionProblem: boolean;
      // Back to open after a payment was checked: the payer can try again.
      isDeclined: boolean;
      orderId: string;
      qrPayload: string;
    }
  | {
      status: "paying";
      hasConnectionProblem: boolean;
      orderId: string;
      qrPayload: string;
    }
  | { status: "paid" }
  | { status: "expired" };

export interface OrderDialogProps {
  creation: OrderCreation | null;
  /** The order POST /orders gave back, or null before that. */
  order: Order | null;
  handleAcknowledge: () => void;
  handleCancel: () => void;
  handleTryAgain: () => void;
}

/** The dialog's title and the status line under it. */
const getDialogText = (
  state: OrderDialogState,
  t: TFunction<"till">,
): { description: string; title: string } => {
  switch (state.status) {
    case "closed":
    case "creating":
      return {
        title: t("home.order.creatingTitle"),
        description: t("home.order.creatingDescription"),
      };
    case "unconfirmed":
      return {
        title: t("home.order.unconfirmedTitle"),
        description: t("home.order.unconfirmedDescription"),
      };
    case "failed":
      return {
        title: t("home.order.failedTitle"),
        description: t("home.order.failedDescription"),
      };
    case "open":
      return {
        title: t("home.order.scanToPay"),
        description: state.isDeclined
          ? t("home.order.declined")
          : t("home.order.waiting"),
      };
    case "paying":
      return {
        title: t("home.order.scanToPay"),
        description: t("home.order.paying"),
      };
    case "paid":
      return {
        title: t("home.order.paidTitle"),
        description: t("home.order.paidDescription"),
      };
    case "expired":
      return {
        title: t("home.order.expiredTitle"),
        description: t("home.order.expiredDescription"),
      };
  }
};

const OrderDialog: FC<OrderDialogProps> = ({
  creation,
  order,
  handleAcknowledge,
  handleCancel,
  handleTryAgain,
}) => {
  const { t } = useTranslation("till");
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

  const { description, title } = getDialogText(state, t);
  // The QR only while the order can be paid, so nobody scans a settled one.
  const payableOrder: PayableOrder | null =
    state.status === "open" || state.status === "paying"
      ? { orderId: state.orderId, qrPayload: state.qrPayload }
      : null;
  const isConnectionProblemShown =
    (state.status === "open" || state.status === "paying") &&
    state.hasConnectionProblem;

  let dialogActions: DialogActions = "none";
  if (state.status === "unconfirmed" || state.status === "failed") {
    dialogActions = "tryAgain";
  } else if (state.status === "paid" || state.status === "expired") {
    dialogActions = "acknowledge";
  }

  return (
    <OrderDialogJSX
      description={description}
      dialogActions={dialogActions}
      hasConnectionProblem={isConnectionProblemShown}
      isOpen={state.status !== "closed"}
      payableOrder={payableOrder}
      title={title}
      handleAcknowledge={handleAcknowledge}
      handleCancel={handleCancel}
      handleTryAgain={handleTryAgain}
    />
  );
};

export default OrderDialog;

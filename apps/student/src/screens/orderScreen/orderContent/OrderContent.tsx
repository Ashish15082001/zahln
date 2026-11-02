import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import type { PayerOrder } from "@zahln/domain/order/frontend";
import type { TFunction } from "i18next";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import OrderContentJSX, {
  type ClosedOrderMessage,
  type OrderContentState,
} from "./OrderContentJSX";

/** What the screen shows, from first load to the order. */
export type OrderScreenState =
  | { status: "loading" }
  // No such order, e.g. from a mistyped code.
  | { status: "notFound" }
  // The first load failed, so there is nothing to show.
  | { status: "error"; isRetrying: boolean }
  // paymentPath: the payer's own payment for this order, when there is one.
  | { status: "ready"; order: PayerOrder; paymentPath: string | null };

export interface OrderContentProps {
  state: OrderScreenState;
  handleRetry: () => void;
  handleTimeUp: () => void;
}

/**
 * What an order that can't be paid any more says, with its icon. `isOwn`:
 * the payment is this payer's, so "your payment" is true.
 */
const getClosedOrderMessage = (
  orderStatus: Exclude<PayerOrder["status"], "open">,
  isOwn: boolean,
  t: TFunction<"student">,
): ClosedOrderMessage => {
  switch (orderStatus) {
    case "paying":
      return {
        description: isOwn
          ? t("order.payingYoursDescription")
          : t("order.payingDescription"),
        icon: Clock01Icon,
        title: t("order.payingTitle"),
      };
    case "paid":
      return {
        description: isOwn
          ? t("order.paidYoursDescription")
          : t("order.paidDescription"),
        icon: CheckmarkCircle02Icon,
        title: t("order.paidTitle"),
      };
    case "expired":
      return {
        description: t("order.expiredDescription"),
        icon: Alert02Icon,
        title: t("order.expiredTitle"),
      };
  }
};

const OrderContent: FC<OrderContentProps> = ({
  state,
  handleRetry,
  handleTimeUp,
}) => {
  const { t } = useTranslation("student");

  // A loaded order is either still open or closed; a closed one comes to the
  // markup with its words ready.
  let contentState: OrderContentState;
  if (state.status !== "ready") {
    contentState = state;
  } else if (state.order.status === "open") {
    contentState = { status: "open", order: state.order };
  } else {
    contentState = {
      status: "closed",
      closedOrderMessage: getClosedOrderMessage(
        state.order.status,
        state.paymentPath !== null,
        t,
      ),
      paymentPath: state.paymentPath,
    };
  }

  return (
    <OrderContentJSX
      state={contentState}
      handleRetry={handleRetry}
      handleTimeUp={handleTimeUp}
    />
  );
};

export default OrderContent;

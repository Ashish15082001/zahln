import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import type { TFunction } from "i18next";
import type { FC, Ref } from "react";
import { useTranslation } from "react-i18next";
import PayContentJSX, {
  type ClosedMessage,
  type PayContentState,
} from "./PayContentJSX";

/** What the screen shows, from first load to the payer's payment. */
export type PayScreenState =
  | Exclude<PayContentState, { status: "closed" }>
  // Someone else's payment holds it or paid it, or its time ran out.
  | { status: "closed"; orderStatus: "paying" | "paid" | "expired" };

export interface PayContentProps {
  // The heading of the payer's own payment, where focus goes on each answer.
  resultHeadingRef: Ref<HTMLHeadingElement>;
  state: PayScreenState;
  handleGoHome: () => void;
  handleRetry: () => void;
  handleTimeUp: () => void;
}

/** Why the payer can't pay this order: it is someone else's, or too late. */
const getClosedMessage = (
  orderStatus: "paying" | "paid" | "expired",
  t: TFunction<"student">,
): ClosedMessage => {
  switch (orderStatus) {
    case "paying":
      return {
        description: t("order.payingDescription"),
        icon: Clock01Icon,
        title: t("order.payingTitle"),
      };
    case "paid":
      return {
        description: t("order.paidDescription"),
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

const PayContent: FC<PayContentProps> = ({
  resultHeadingRef,
  state,
  handleGoHome,
  handleRetry,
  handleTimeUp,
}) => {
  const { t } = useTranslation("student");

  // A closed order comes to the markup with its words ready.
  const contentState: PayContentState =
    state.status === "closed"
      ? {
          status: "closed",
          closedMessage: getClosedMessage(state.orderStatus, t),
        }
      : state;

  return (
    <PayContentJSX
      resultHeadingRef={resultHeadingRef}
      state={contentState}
      handleGoHome={handleGoHome}
      handleRetry={handleRetry}
      handleTimeUp={handleTimeUp}
    />
  );
};

export default PayContent;

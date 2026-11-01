import { CheckmarkCircle02Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import type { Payment } from "@zahln/domain/payment/frontend";
import type { FC, Ref } from "react";
import { useTranslation } from "react-i18next";
import OwnPaymentJSX from "./OwnPaymentJSX";

/**
 * Where the payer's own payment stands. longPending: still pending once the
 * page has stopped asking, since a check can take minutes.
 */
export type OwnPaymentStatus = "pending" | "longPending" | "confirmed";

export interface OwnPaymentProps {
  // The result's heading, where focus goes each time the result changes.
  headingRef: Ref<HTMLHeadingElement>;
  // Null until it loads, when the page opened on an order already paid.
  payment: Payment | null;
  paymentStatus: OwnPaymentStatus;
  // Null until the payment's detail has come: the 201 doesn't name the till.
  tillName: string | null;
}

const OwnPayment: FC<OwnPaymentProps> = ({
  headingRef,
  payment,
  paymentStatus,
  tillName,
}) => {
  const { t } = useTranslation("student");

  const isConfirmed = paymentStatus === "confirmed";
  const icon = isConfirmed ? CheckmarkCircle02Icon : Clock01Icon;
  const title = t(`pay.ownPayment.${paymentStatus}Title`);
  const description = t(`pay.ownPayment.${paymentStatus}Description`);

  return (
    <OwnPaymentJSX
      description={description}
      headingRef={headingRef}
      icon={icon}
      payment={payment}
      tillName={tillName}
      title={title}
    />
  );
};

export default OwnPayment;

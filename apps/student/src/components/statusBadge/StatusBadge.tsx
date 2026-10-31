import type {
  PaymentStatus,
  RefundStatus,
} from "@zahln/domain/payment/frontend";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import StatusBadgeJSX, { type StatusTone } from "./StatusBadgeJSX";

/**
 * A payment's or a refund's status. They share `pending` but not its words:
 * a pending payment is being checked, a pending refund is being processed.
 */
export type StatusBadgeProps =
  | { kind: "payment"; status: PaymentStatus }
  | { kind: "refund"; status: RefundStatus };

const paymentTones: Record<PaymentStatus, StatusTone> = {
  pending: "warning",
  confirmed: "success",
  declined: "destructive",
};

const refundTones: Record<RefundStatus, StatusTone> = {
  pending: "warning",
  completed: "success",
  failed: "destructive",
};

// Props aren't destructured: checking `props.kind` is what narrows `status`
// to the right set of values.
const StatusBadge: FC<StatusBadgeProps> = (props) => {
  const { t } = useTranslation("student");

  if (props.kind === "payment") {
    return (
      <StatusBadgeJSX
        label={t(`paymentStatus.${props.status}`)}
        tone={paymentTones[props.status]}
      />
    );
  }

  return (
    <StatusBadgeJSX
      label={t(`refundStatus.${props.status}`)}
      tone={refundTones[props.status]}
    />
  );
};

export default StatusBadge;

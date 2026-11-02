import type {
  PaymentStatus,
  RefundStatus,
} from "@zahln/domain/payment/frontend";
import StatusBadgeJSX, {
  type StatusTone,
} from "@zahln/ui/components/statusBadge/StatusBadgeJSX";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

/**
 * A payment's or a refund's status. They share `pending` but not its words:
 * a pending payment is being checked, a pending refund is being processed.
 */
export type StatusBadgeProps =
  | { kind: "payment"; status: PaymentStatus }
  | { kind: "refund"; status: RefundStatus };

// The same tones as the student app and the till, so a status looks alike on
// every screen.
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
  const { t } = useTranslation("dashboard");

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

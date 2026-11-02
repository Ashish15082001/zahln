import type { PaymentStatus } from "@zahln/domain/payment/frontend";
import StatusBadgeJSX, {
  type StatusTone,
} from "@zahln/ui/components/statusBadge/StatusBadgeJSX";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

export interface StatusBadgeProps {
  status: PaymentStatus;
}

// The same tones as the student app and the till, so a status looks alike on
// every screen.
const paymentTones: Record<PaymentStatus, StatusTone> = {
  pending: "warning",
  confirmed: "success",
  declined: "destructive",
};

/** A payment's status, in the dashboard's words. */
const StatusBadge: FC<StatusBadgeProps> = ({ status }) => {
  const { t } = useTranslation("dashboard");

  return (
    <StatusBadgeJSX
      label={t(`paymentStatus.${status}`)}
      tone={paymentTones[status]}
    />
  );
};

export default StatusBadge;

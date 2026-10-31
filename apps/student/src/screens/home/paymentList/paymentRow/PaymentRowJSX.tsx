import {
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { PaymentStatus } from "@zahln/domain/payment/frontend";
import { Badge } from "@zahln/ui/components/badge";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

// Solid colours with white text, not the badge's tinted `destructive`
// variant: red text on its own 10% tint is 4.39:1, under the 4.5:1 minimum.
// Every status has its own icon and word too, so colour is never the only
// signal.
const statusBadges = {
  pending: {
    icon: Clock01Icon,
    className: "bg-warning text-warning-foreground",
  },
  confirmed: {
    icon: CheckmarkCircle02Icon,
    className: "bg-success text-success-foreground",
  },
  declined: {
    icon: CancelCircleIcon,
    className: "bg-destructive text-white",
  },
} satisfies Record<
  PaymentStatus,
  { icon: typeof Clock01Icon; className: string }
>;

export interface PaymentRowJSXProps {
  amount: string;
  createdAt: string;
  createdAtIso: string;
  itemsSummary: string;
  mensaName: string;
  pendingRefund: string | null;
  refunded: string | null;
  status: PaymentStatus;
}

const PaymentRowJSX: FC<PaymentRowJSXProps> = ({
  amount,
  createdAt,
  createdAtIso,
  itemsSummary,
  mensaName,
  pendingRefund,
  refunded,
  status,
}) => {
  const { t } = useTranslation("student");
  const statusBadge = statusBadges[status];

  return (
    <li className="flex flex-col gap-1 py-3">
      <div className="flex items-start justify-between gap-4">
        <span className="font-medium">{mensaName}</span>
        <span className="font-medium tabular-nums">{amount}</span>
      </div>
      <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <time dateTime={createdAtIso}>{createdAt}</time>
        <Badge className={statusBadge.className}>
          <HugeiconsIcon aria-hidden icon={statusBadge.icon} />
          {t(`home.payments.status.${status}`)}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">{itemsSummary}</p>
      {refunded !== null && (
        <p className="text-sm">
          {t("home.payments.refunded", { amount: refunded })}
        </p>
      )}
      {pendingRefund !== null && (
        <p className="text-sm">
          {t("home.payments.refundPending", { amount: pendingRefund })}
        </p>
      )}
    </li>
  );
};

export default PaymentRowJSX;

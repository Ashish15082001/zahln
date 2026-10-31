import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { PaymentStatus } from "@zahln/domain/payment/frontend";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import StatusBadge from "../../../../components/statusBadge/StatusBadge";

export interface PaymentRowJSXProps {
  amount: string;
  createdAt: string;
  createdAtIso: string;
  itemsSummary: string;
  mensaName: string;
  paymentPath: string;
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
  paymentPath,
  pendingRefund,
  refunded,
  status,
}) => {
  const { t } = useTranslation("student");

  return (
    <li>
      {/* A real link around the whole row: the tap target is the row, and
          TalkBack reads it as one link to the payment's detail. */}
      <Link
        className="flex items-center gap-3 rounded-md py-3 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        to={paymentPath}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-4">
            <span className="font-medium">{mensaName}</span>
            <span className="font-medium tabular-nums">{amount}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
            <time dateTime={createdAtIso}>{createdAt}</time>
            <StatusBadge kind="payment" status={status} />
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
        </div>
        <HugeiconsIcon
          aria-hidden
          className="shrink-0 text-muted-foreground"
          icon={ArrowRight01Icon}
        />
      </Link>
    </li>
  );
};

export default PaymentRowJSX;

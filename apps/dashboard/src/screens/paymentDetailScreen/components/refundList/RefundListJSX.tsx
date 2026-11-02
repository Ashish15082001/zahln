import type { RefundStatus } from "@zahln/domain/payment/frontend";
import DateTimeJSX from "@zahln/ui/components/dateTime/DateTimeJSX";
import { useId, type FC } from "react";
import { useTranslation } from "react-i18next";
import StatusBadge from "../../../../components/statusBadge/StatusBadge";

/** One refund, written out in the app language. */
export interface RefundLine {
  amount: string;
  createdAt: string;
  createdAtIso: string;
  id: string;
  // Null when the cashier gave none.
  reason: string | null;
  status: RefundStatus;
}

export interface RefundListJSXProps {
  refundLines: RefundLine[];
}

/**
 * Every refund of the payment, with its status. Shown when there are none
 * too, unlike in the student app: finance checking a payment wants to see
 * that nothing went back, not wonder whether the list loaded.
 */
const RefundListJSX: FC<RefundListJSXProps> = ({ refundLines }) => {
  const { t } = useTranslation("dashboard");
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold" id={headingId}>
        {t("paymentDetail.refunds.title")}
      </h2>
      {refundLines.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("paymentDetail.refunds.empty")}
        </p>
      ) : (
        <ul className="divide-y">
          {refundLines.map((refundLine) => (
            <li key={refundLine.id} className="flex flex-col gap-1 py-2">
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium tabular-nums">
                  {refundLine.amount}
                </span>
                <StatusBadge kind="refund" status={refundLine.status} />
              </div>
              <DateTimeJSX
                className="text-sm text-muted-foreground"
                dateTimeIso={refundLine.createdAtIso}
                value={refundLine.createdAt}
              />
              {refundLine.reason !== null && (
                <p className="text-sm">{refundLine.reason}</p>
              )}
              {/* The refund's own id, for a question to support about it. */}
              <span className="font-mono text-xs break-all text-muted-foreground">
                {refundLine.id}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default RefundListJSX;

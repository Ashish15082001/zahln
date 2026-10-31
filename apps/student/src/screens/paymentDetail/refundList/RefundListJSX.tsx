import type { RefundStatus } from "@zahln/domain/payment/frontend";
import { useId, type FC } from "react";
import { useTranslation } from "react-i18next";
import StatusBadge from "../../../components/statusBadge/StatusBadge";

/** One refund, written out in the app language. */
export interface RefundLine {
  amount: string;
  createdAt: string;
  createdAtIso: string;
  id: string;
  reason: string | null;
  status: RefundStatus;
}

export interface RefundListJSXProps {
  refundLines: RefundLine[];
}

const RefundListJSX: FC<RefundListJSXProps> = ({ refundLines }) => {
  const { t } = useTranslation("student");
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2">
      <h2 id={headingId} className="text-lg font-semibold">
        {t("paymentDetail.refunds")}
      </h2>
      <ul className="divide-y">
        {refundLines.map((refundLine) => (
          <li key={refundLine.id} className="flex flex-col gap-1 py-2">
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium tabular-nums">
                {refundLine.amount}
              </span>
              <StatusBadge kind="refund" status={refundLine.status} />
            </div>
            <time
              className="text-sm text-muted-foreground"
              dateTime={refundLine.createdAtIso}
            >
              {refundLine.createdAt}
            </time>
            {refundLine.reason !== null && (
              <p className="text-sm">{refundLine.reason}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default RefundListJSX;

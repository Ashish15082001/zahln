import type { PaymentStatus } from "@zahln/domain/payment/frontend";
import { useId, type FC } from "react";
import { useTranslation } from "react-i18next";
import StatusBadge from "../statusBadge/StatusBadge";

/** One dish on the payment, written out in the app language. */
export interface ItemLine {
  itemId: string;
  lineTotal: string;
  name: string;
  unitPrice: string;
}

export interface PaymentSummaryJSXProps {
  amount: string;
  createdAt: string;
  createdAtIso: string;
  itemLines: ItemLine[];
  pendingRefund: string | null;
  place: string;
  refunded: string | null;
  status: PaymentStatus;
}

const PaymentSummaryJSX: FC<PaymentSummaryJSXProps> = ({
  amount,
  createdAt,
  createdAtIso,
  itemLines,
  pendingRefund,
  place,
  refunded,
  status,
}) => {
  const { t } = useTranslation("student");
  const itemsHeadingId = useId();

  return (
    <>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-3xl font-semibold tabular-nums">{amount}</span>
          <StatusBadge kind="payment" status={status} />
        </div>
        <p className="text-muted-foreground">{place}</p>
        <time className="text-sm text-muted-foreground" dateTime={createdAtIso}>
          {createdAt}
        </time>
      </div>
      <section aria-labelledby={itemsHeadingId} className="flex flex-col gap-2">
        <h2 id={itemsHeadingId} className="text-lg font-semibold">
          {t("paymentDetail.items")}
        </h2>
        <ul className="divide-y">
          {itemLines.map((itemLine) => (
            <li
              key={itemLine.itemId}
              className="flex items-start justify-between gap-4 py-2"
            >
              <div className="flex flex-col">
                <span>{itemLine.name}</span>
                <span className="text-sm text-muted-foreground">
                  {itemLine.unitPrice}
                </span>
              </div>
              <span className="tabular-nums">{itemLine.lineTotal}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between gap-4 border-t pt-2 font-semibold">
          <span>{t("paymentDetail.total")}</span>
          <span className="tabular-nums">{amount}</span>
        </div>
        {refunded !== null && (
          <p className="text-sm">
            {t("paymentDetail.refunded", { amount: refunded })}
          </p>
        )}
        {pendingRefund !== null && (
          <p className="text-sm">
            {t("paymentDetail.refundPending", { amount: pendingRefund })}
          </p>
        )}
      </section>
    </>
  );
};

export default PaymentSummaryJSX;

import type { Payment } from "@zahln/domain/payment/frontend";
import { formatCents, formatDateTime } from "@zahln/i18n/format";
import { pickLanguage } from "@zahln/i18n/language";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import PaymentSummaryJSX, { type ItemLine } from "./PaymentSummaryJSX";

export interface PaymentSummaryProps {
  payment: Payment;
  // Null until the detail has come: the list's row doesn't name the till.
  tillName: string | null;
}

const PaymentSummary: FC<PaymentSummaryProps> = ({ payment, tillName }) => {
  const { t, i18n } = useTranslation("student");
  // i18next only resolves to a supported language. pickLanguage narrows the
  // type to AppLanguage, with English if that ever changes.
  const language = pickLanguage([i18n.resolvedLanguage ?? ""]);

  const amount = formatCents(payment.amountCents, language);
  const createdAt = formatDateTime(payment.createdAtMs, language);
  // For <time>, so the date is machine-readable whatever language it shows in.
  const createdAtIso = new Date(payment.createdAtMs).toISOString();
  // The names are from the server, so the dot between them is the only text
  // here, and it reads the same in any language.
  const place =
    tillName === null
      ? payment.mensaName
      : `${payment.mensaName} · ${tillName}`;
  const itemLines: ItemLine[] = payment.items.map((item) => ({
    itemId: item.itemId,
    lineTotal: formatCents(item.unitPriceCents * item.quantity, language),
    name: item.name[language],
    unitPrice: t("paymentDetail.unitPrice", {
      quantity: item.quantity,
      unitPrice: formatCents(item.unitPriceCents, language),
    }),
  }));
  // Null hides the line: most payments have no refund at all.
  const refunded =
    payment.refundedAmountCents > 0
      ? formatCents(payment.refundedAmountCents, language)
      : null;
  const pendingRefund =
    payment.pendingRefundAmountCents > 0
      ? formatCents(payment.pendingRefundAmountCents, language)
      : null;

  return (
    <PaymentSummaryJSX
      amount={amount}
      createdAt={createdAt}
      createdAtIso={createdAtIso}
      itemLines={itemLines}
      pendingRefund={pendingRefund}
      place={place}
      refunded={refunded}
      status={payment.status}
    />
  );
};

export default PaymentSummary;

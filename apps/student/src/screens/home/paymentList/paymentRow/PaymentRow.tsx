import type { Payment } from "@zahln/domain/payment/frontend";
import { formatCents, formatDateTime } from "@zahln/i18n/format";
import { pickLanguage } from "@zahln/i18n/language";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import PaymentRowJSX from "./PaymentRowJSX";

export interface PaymentRowProps {
  payment: Payment;
}

const PaymentRow: FC<PaymentRowProps> = ({ payment }) => {
  const { t, i18n } = useTranslation("student");
  // i18next only resolves to a supported language. pickLanguage narrows the
  // type to AppLanguage, with English if that ever changes.
  const language = pickLanguage([i18n.resolvedLanguage ?? ""]);

  const amount = formatCents(payment.amountCents, language);
  const createdAt = formatDateTime(payment.createdAtMs, language);
  // For <time>, so the date is machine-readable whatever language it shows in.
  const createdAtIso = new Date(payment.createdAtMs).toISOString();
  const itemsSummary = payment.items
    .map((item) =>
      t("home.payments.item", {
        quantity: item.quantity,
        name: item.name[language],
      }),
    )
    .join(", ");
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
    <PaymentRowJSX
      amount={amount}
      createdAt={createdAt}
      createdAtIso={createdAtIso}
      itemsSummary={itemsSummary}
      mensaName={payment.mensaName}
      pendingRefund={pendingRefund}
      refunded={refunded}
      status={payment.status}
    />
  );
};

export default PaymentRow;

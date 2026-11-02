import type { FinancePayment } from "@zahln/domain/payment/frontend";
import { formatCents, formatDateTime } from "@zahln/i18n/format";
import { pickLanguage } from "@zahln/i18n/language";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import PaymentFactsJSX from "./PaymentFactsJSX";

export interface PaymentFactsProps {
  // A list's copy or the detail: both have every fact shown here.
  payment: FinancePayment;
}

const PaymentFacts: FC<PaymentFactsProps> = ({ payment }) => {
  const { t, i18n } = useTranslation("dashboard");
  // i18next only resolves to a supported language. pickLanguage narrows the
  // type to AppLanguage, with English if that ever changes.
  const language = pickLanguage([i18n.resolvedLanguage ?? ""]);

  return (
    <PaymentFactsJSX
      amount={formatCents(payment.amountCents, language)}
      createdAt={formatDateTime(payment.createdAtMs, language)}
      // For <time>, so the date is machine-readable whatever language it
      // shows in.
      createdAtIso={new Date(payment.createdAtMs).toISOString()}
      orderId={payment.orderId}
      payerId={payment.payerId}
      payerName={payment.payerName}
      paymentId={payment.id}
      // The names are from the server, so the dot between them is the only
      // text here, and it reads the same in any language.
      place={`${payment.mensaName} · ${payment.tillName}`}
      priceGroup={t(`priceGroup.${payment.priceGroup}`)}
      refundable={formatCents(payment.refundableAmountCents, language)}
      refunded={formatCents(payment.refundedAmountCents, language)}
      refundPending={formatCents(payment.pendingRefundAmountCents, language)}
      status={payment.status}
    />
  );
};

export default PaymentFacts;

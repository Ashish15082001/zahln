import type { PaymentEvent } from "@zahln/domain/payment/frontend";
import { formatCents, formatDateTimeWithSeconds } from "@zahln/i18n/format";
import { pickLanguage } from "@zahln/i18n/language";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import PaymentHistoryJSX, { type EventLine } from "./PaymentHistoryJSX";

export interface PaymentHistoryProps {
  history: PaymentEvent[];
}

const PaymentHistory: FC<PaymentHistoryProps> = ({ history }) => {
  const { t, i18n } = useTranslation("dashboard");
  // i18next only resolves to a supported language. pickLanguage narrows the
  // type to AppLanguage, with English if that ever changes.
  const language = pickLanguage([i18n.resolvedLanguage ?? ""]);

  const eventLines: EventLine[] = history.map((event, index) => ({
    amount:
      event.amountCents === null
        ? null
        : formatCents(event.amountCents, language),
    // With seconds: a payment is often confirmed seconds after it started.
    at: formatDateTimeWithSeconds(event.atMs, language),
    atIso: new Date(event.atMs).toISOString(),
    // Events have no id. The history only ever grows at the end, so an index
    // stays with its event from one read to the next.
    key: `${index}-${event.type}`,
    label: t(`paymentDetail.history.events.${event.type}`),
  }));

  return <PaymentHistoryJSX eventLines={eventLines} />;
};

export default PaymentHistory;

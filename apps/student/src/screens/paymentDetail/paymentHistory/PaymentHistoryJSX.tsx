import { useId, type FC } from "react";
import { useTranslation } from "react-i18next";

/** One step of the payment's history, written out in the app language. */
export interface EventLine {
  amount: string | null;
  at: string;
  atIso: string;
  key: string;
  label: string;
}

export interface PaymentHistoryJSXProps {
  eventLines: EventLine[];
}

const PaymentHistoryJSX: FC<PaymentHistoryJSXProps> = ({ eventLines }) => {
  const { t } = useTranslation("student");
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2">
      <h2 id={headingId} className="text-lg font-semibold">
        {t("paymentDetail.history")}
      </h2>
      {/* Ordered, oldest first as the server sends it: the order is the
          point, and TalkBack says "1 of 4" as it reads each step. */}
      <ol className="flex flex-col gap-3 border-l-2 pl-4">
        {eventLines.map((eventLine) => (
          <li key={eventLine.key} className="flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <span className="font-medium">{eventLine.label}</span>
              {eventLine.amount !== null && (
                <span className="tabular-nums">{eventLine.amount}</span>
              )}
            </div>
            <time
              className="text-sm text-muted-foreground"
              dateTime={eventLine.atIso}
            >
              {eventLine.at}
            </time>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default PaymentHistoryJSX;

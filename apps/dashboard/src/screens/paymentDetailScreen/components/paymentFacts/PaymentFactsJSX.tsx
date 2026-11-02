import type { PaymentStatus } from "@zahln/domain/payment/frontend";
import { Card } from "@zahln/ui/components/card";
import DateTimeJSX from "@zahln/ui/components/dateTime/DateTimeJSX";
import { useId, type FC } from "react";
import { useTranslation } from "react-i18next";
import StatusBadge from "../../../../components/statusBadge/StatusBadge";

export interface PaymentFactsJSXProps {
  amount: string;
  createdAt: string;
  createdAtIso: string;
  orderId: string;
  payerId: string;
  payerName: string;
  paymentId: string;
  place: string;
  priceGroup: string;
  refundable: string;
  refunded: string;
  refundPending: string;
  status: PaymentStatus;
}

// Each fact is its label above its value.
const FACT_CLASS_NAME = "flex flex-col gap-0.5";
const LABEL_CLASS_NAME = "text-sm text-muted-foreground";
// Ids in full and in a monospace font, so they can be read out to support or
// copied exactly. break-all, since each is one long word.
const ID_CLASS_NAME = "font-mono text-sm break-all";

/**
 * What the payment is: the amount and status first, then the facts finance
 * checks, as a description list so a screen reader reads each value with
 * its label.
 */
const PaymentFactsJSX: FC<PaymentFactsJSXProps> = ({
  amount,
  createdAt,
  createdAtIso,
  orderId,
  payerId,
  payerName,
  paymentId,
  place,
  priceGroup,
  refundable,
  refunded,
  refundPending,
  status,
}) => {
  const { t } = useTranslation("dashboard");
  const headingId = useId();

  return (
    <Card aria-labelledby={headingId} className="gap-4 px-6" role="region">
      <h2 className="text-lg font-semibold" id={headingId}>
        {t("paymentDetail.facts.title")}
      </h2>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="text-3xl font-semibold">{amount}</span>
        <StatusBadge kind="payment" status={status} />
      </div>
      <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <div className={FACT_CLASS_NAME}>
          <dt className={LABEL_CLASS_NAME}>
            {t("paymentDetail.facts.created")}
          </dt>
          <dd>
            <DateTimeJSX dateTimeIso={createdAtIso} value={createdAt} />
          </dd>
        </div>
        <div className={FACT_CLASS_NAME}>
          <dt className={LABEL_CLASS_NAME}>{t("paymentDetail.facts.place")}</dt>
          <dd>{place}</dd>
        </div>
        <div className={FACT_CLASS_NAME}>
          <dt className={LABEL_CLASS_NAME}>{t("paymentDetail.facts.payer")}</dt>
          <dd className="flex flex-col">
            <span>{payerName}</span>
            <span className={ID_CLASS_NAME}>{payerId}</span>
          </dd>
        </div>
        <div className={FACT_CLASS_NAME}>
          <dt className={LABEL_CLASS_NAME}>
            {t("paymentDetail.facts.priceGroup")}
          </dt>
          <dd>{priceGroup}</dd>
        </div>
        <div className={FACT_CLASS_NAME}>
          <dt className={LABEL_CLASS_NAME}>
            {t("paymentDetail.facts.refunded")}
          </dt>
          <dd>{refunded}</dd>
        </div>
        <div className={FACT_CLASS_NAME}>
          <dt className={LABEL_CLASS_NAME}>
            {t("paymentDetail.facts.refundPending")}
          </dt>
          <dd>{refundPending}</dd>
        </div>
        <div className={FACT_CLASS_NAME}>
          <dt className={LABEL_CLASS_NAME}>
            {t("paymentDetail.facts.refundable")}
          </dt>
          <dd>{refundable}</dd>
        </div>
        <div className={FACT_CLASS_NAME}>
          <dt className={LABEL_CLASS_NAME}>
            {t("paymentDetail.facts.orderId")}
          </dt>
          <dd className={ID_CLASS_NAME}>{orderId}</dd>
        </div>
        <div className={FACT_CLASS_NAME}>
          <dt className={LABEL_CLASS_NAME}>
            {t("paymentDetail.facts.paymentId")}
          </dt>
          <dd className={ID_CLASS_NAME}>{paymentId}</dd>
        </div>
      </dl>
    </Card>
  );
};

export default PaymentFactsJSX;

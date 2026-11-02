import type { Refund } from "@zahln/domain/payment/frontend";
import { formatCents, formatDateTime } from "@zahln/i18n/format";
import { pickLanguage } from "@zahln/i18n/language";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import RefundListJSX, { type RefundLine } from "./RefundListJSX";

export interface RefundListProps {
  refunds: Refund[];
}

const RefundList: FC<RefundListProps> = ({ refunds }) => {
  const { t, i18n } = useTranslation("dashboard");
  // i18next only resolves to a supported language. pickLanguage narrows the
  // type to AppLanguage, with English if that ever changes.
  const language = pickLanguage([i18n.resolvedLanguage ?? ""]);

  const refundLines: RefundLine[] = refunds.map((refund) => ({
    amount: formatCents(refund.amountCents, language),
    createdAt: formatDateTime(refund.createdAtMs, language),
    createdAtIso: new Date(refund.createdAtMs).toISOString(),
    id: refund.id,
    reason:
      refund.reason === null
        ? null
        : t("paymentDetail.refunds.reason", { reason: refund.reason }),
    status: refund.status,
  }));

  return <RefundListJSX refundLines={refundLines} />;
};

export default RefundList;

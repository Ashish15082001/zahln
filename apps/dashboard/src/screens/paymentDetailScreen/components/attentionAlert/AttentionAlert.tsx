import type { AttentionReason } from "@zahln/domain/payment/frontend";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import AttentionAlertJSX, { type ReasonLine } from "./AttentionAlertJSX";

export interface AttentionAlertProps {
  attentionReasons: AttentionReason[];
  needsAttention: boolean;
}

const AttentionAlert: FC<AttentionAlertProps> = ({
  attentionReasons,
  needsAttention,
}) => {
  const { t } = useTranslation("dashboard");
  // Most payments need nothing, so there is nothing to show.
  if (!needsAttention) return null;

  // Each reason once: two unknown ones both read "other", and saying it
  // twice would say nothing more.
  const reasonLines: ReasonLine[] = [...new Set(attentionReasons)].map(
    (reason) => ({
      label: t(`paymentDetail.attention.reasons.${reason}`),
      reason,
    }),
  );

  return <AttentionAlertJSX reasonLines={reasonLines} />;
};

export default AttentionAlert;

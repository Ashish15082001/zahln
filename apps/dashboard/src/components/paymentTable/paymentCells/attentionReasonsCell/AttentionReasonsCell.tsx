import type { AttentionReason } from "@zahln/domain/payment/frontend";
import type { StatusTone } from "@zahln/ui/components/statusBadge/StatusBadgeJSX";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import AttentionReasonsCellJSX, {
  type ReasonBadge,
} from "./AttentionReasonsCellJSX";

export interface AttentionReasonsCellProps {
  attentionReasons: AttentionReason[];
}

// A refund that failed went wrong; the rest are still going and taking too
// long. The badge's icon and words say which, not its colour alone.
const reasonTones: Record<AttentionReason, StatusTone> = {
  pending_too_long: "warning",
  refund_pending_too_long: "warning",
  refund_failed: "destructive",
  other: "warning",
};

const AttentionReasonsCell: FC<AttentionReasonsCellProps> = ({
  attentionReasons,
}) => {
  const { t } = useTranslation("dashboard");

  // Each reason once: two unknown ones both read "Other reason", and saying
  // it twice would say nothing more.
  const reasonBadges: ReasonBadge[] = [...new Set(attentionReasons)].map(
    (reason) => ({
      label: t(`attentionReason.${reason}`),
      reason,
      tone: reasonTones[reason],
    }),
  );

  return <AttentionReasonsCellJSX reasonBadges={reasonBadges} />;
};

export default AttentionReasonsCell;

import type { AttentionReason } from "@zahln/domain/payment/frontend";
import StatusBadgeJSX, {
  type StatusTone,
} from "@zahln/ui/components/statusBadge/StatusBadgeJSX";
import type { FC } from "react";

/** One reason as a badge, with its words ready to show. */
export interface ReasonBadge {
  label: string;
  reason: AttentionReason;
  tone: StatusTone;
}

export interface AttentionReasonsCellJSXProps {
  reasonBadges: ReasonBadge[];
}

// One badge per reason, stacked, so a payment with two reasons shows both
// without widening the table.
const AttentionReasonsCellJSX: FC<AttentionReasonsCellJSXProps> = ({
  reasonBadges,
}) => (
  <div className="flex flex-col items-start gap-1">
    {reasonBadges.map((reasonBadge) => (
      <StatusBadgeJSX
        key={reasonBadge.reason}
        label={reasonBadge.label}
        tone={reasonBadge.tone}
      />
    ))}
  </div>
);

export default AttentionReasonsCellJSX;

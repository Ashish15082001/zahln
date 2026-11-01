import {
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Badge } from "@zahln/ui/components/badge";
import type { FC } from "react";

/** How a status reads: done, still going, or went wrong. */
export type StatusTone = "success" | "warning" | "destructive";

// Solid colours with white text, not the badge's tinted `destructive`
// variant: red text on its own 10% tint is 4.39:1, under the 4.5:1 minimum.
// Every tone has its own icon and the badge always has words, so colour is
// never the only signal.
const toneStyles = {
  success: {
    icon: CheckmarkCircle02Icon,
    className: "bg-success text-success-foreground",
  },
  warning: {
    icon: Clock01Icon,
    className: "bg-warning text-warning-foreground",
  },
  destructive: {
    icon: CancelCircleIcon,
    className: "bg-destructive text-white",
  },
} satisfies Record<StatusTone, { icon: typeof Clock01Icon; className: string }>;

export interface StatusBadgeJSXProps {
  label: string;
  tone: StatusTone;
}

/**
 * A status as a solid badge with an icon and a word. Shared by the student
 * app and the till, so a status looks the same in both; each app decides the
 * word and the tone for its own statuses.
 */
const StatusBadgeJSX: FC<StatusBadgeJSXProps> = ({ label, tone }) => {
  const toneStyle = toneStyles[tone];

  return (
    <Badge className={toneStyle.className}>
      <HugeiconsIcon aria-hidden icon={toneStyle.icon} />
      {label}
    </Badge>
  );
};

export default StatusBadgeJSX;

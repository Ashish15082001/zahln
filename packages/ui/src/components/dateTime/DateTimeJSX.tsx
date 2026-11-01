import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@zahln/ui/lib/utils";
import type { FC } from "react";

export interface DateTimeJSXProps {
  className?: string;
  // The moment as an ISO string, for <time>.
  dateTimeIso: string;
  // The moment as shown, in the app language.
  value: string;
}

/**
 * A date and time, the same on every screen: a calendar icon, then the
 * value. A calendar, not a clock: the status badge's clock already means
 * "being checked". The icon is decoration, so TalkBack reads the value only.
 * A <time>, so the moment is machine-readable whatever language it shows
 * in. The icon takes the text's colour, so a muted date has a muted icon.
 */
const DateTimeJSX: FC<DateTimeJSXProps> = ({
  className,
  dateTimeIso,
  value,
}) => (
  <time
    className={cn("inline-flex items-center gap-1.5", className)}
    dateTime={dateTimeIso}
  >
    <HugeiconsIcon
      aria-hidden
      className="size-4 shrink-0"
      icon={Calendar03Icon}
    />
    {value}
  </time>
);

export default DateTimeJSX;

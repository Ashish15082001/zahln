import { RefreshIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@zahln/ui/components/button";
import type { FC } from "react";

export interface RefreshButtonJSXProps {
  isDisabled: boolean;
  isRefreshing: boolean;
  // The button's name for TalkBack, since it shows no words: "Refresh", or
  // "Refreshing…" while it turns.
  label: string;
  handleRefresh: () => void;
}

/**
 * Refresh as an icon button, the same on every screen that has one. The icon
 * turns while refreshing, where the text button said "Refreshing…": only
 * when the phone allows motion, so it never spins for someone who turned
 * animations off. Disable it while a request is on its way, so a second tap
 * can't start a second one. touch.css makes it 48 px square.
 */
const RefreshButtonJSX: FC<RefreshButtonJSXProps> = ({
  isDisabled,
  isRefreshing,
  label,
  handleRefresh,
}) => (
  <Button
    aria-label={label}
    disabled={isDisabled}
    size="icon"
    variant="outline"
    onClick={handleRefresh}
  >
    <HugeiconsIcon
      aria-hidden
      className={isRefreshing ? "motion-safe:animate-spin" : undefined}
      icon={RefreshIcon}
    />
  </Button>
);

export default RefreshButtonJSX;

import RefreshButtonJSX, {
  type RefreshButtonJSXProps,
} from "@zahln/ui/components/refreshButton/RefreshButtonJSX";
import type { FC } from "react";

export interface ScreenTitleRowJSXProps {
  description: string;
  // Null while there is nothing to refresh.
  refreshButton: Omit<RefreshButtonJSXProps, "handleRefresh"> | null;
  title: string;
  handleRefresh: () => void;
}

/**
 * The top of a signed-in screen's content: its heading, a line on what it
 * shows, and Refresh. The heading is here, not in the header: the header is
 * the same on every screen, and this names the one on show.
 */
const ScreenTitleRowJSX: FC<ScreenTitleRowJSXProps> = ({
  description,
  refreshButton,
  title,
  handleRefresh,
}) => (
  <div className="flex items-start justify-between gap-4">
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    {refreshButton !== null && (
      <RefreshButtonJSX
        isDisabled={refreshButton.isDisabled}
        isRefreshing={refreshButton.isRefreshing}
        label={refreshButton.label}
        handleRefresh={handleRefresh}
      />
    )}
  </div>
);

export default ScreenTitleRowJSX;

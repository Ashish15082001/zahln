import type { FC } from "react";
import { useTranslation } from "react-i18next";
import TotalsTitleRowJSX, {
  type TotalsTitleRowJSXProps,
} from "./TotalsTitleRowJSX";

/** Refresh's look while it shows: off during any request, turning on its own. */
export interface RefreshButtonState {
  isDisabled: boolean;
  isRefreshing: boolean;
}

export interface TotalsTitleRowProps {
  // Null while there is nothing to refresh: the totals are loading, or their
  // first load failed and the report offers Try again instead.
  refreshButtonState: RefreshButtonState | null;
  handleRefresh: () => void;
}

const TotalsTitleRow: FC<TotalsTitleRowProps> = ({
  refreshButtonState,
  handleRefresh,
}) => {
  const { t } = useTranslation("dashboard");

  let refreshButton: TotalsTitleRowJSXProps["refreshButton"] = null;
  if (refreshButtonState !== null) {
    refreshButton = {
      ...refreshButtonState,
      label: refreshButtonState.isRefreshing
        ? t("dailyTotals.refreshing")
        : t("dailyTotals.refresh"),
    };
  }

  return (
    <TotalsTitleRowJSX
      refreshButton={refreshButton}
      handleRefresh={handleRefresh}
    />
  );
};

export default TotalsTitleRow;

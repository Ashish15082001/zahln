import type { FC } from "react";
import { useTranslation } from "react-i18next";
import ScreenTitleRowJSX, {
  type ScreenTitleRowJSXProps,
} from "./ScreenTitleRowJSX";

/** Refresh's look while it shows: off during any request, turning on its own. */
export interface RefreshButtonState {
  isDisabled: boolean;
  isRefreshing: boolean;
}

export interface ScreenTitleRowProps {
  description: string;
  // Null while there is nothing to refresh: the data is loading, or its first
  // load failed and the screen offers Try again instead.
  refreshButtonState: RefreshButtonState | null;
  title: string;
  handleRefresh: () => void;
}

const ScreenTitleRow: FC<ScreenTitleRowProps> = ({
  description,
  refreshButtonState,
  title,
  handleRefresh,
}) => {
  const { t } = useTranslation("dashboard");

  let refreshButton: ScreenTitleRowJSXProps["refreshButton"] = null;
  if (refreshButtonState !== null) {
    refreshButton = {
      ...refreshButtonState,
      label: refreshButtonState.isRefreshing
        ? t("screenTitleRow.refreshing")
        : t("screenTitleRow.refresh"),
    };
  }

  return (
    <ScreenTitleRowJSX
      description={description}
      refreshButton={refreshButton}
      title={title}
      handleRefresh={handleRefresh}
    />
  );
};

export default ScreenTitleRow;

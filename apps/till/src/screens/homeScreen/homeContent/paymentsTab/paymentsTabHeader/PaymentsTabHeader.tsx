import type { FC } from "react";
import { useTranslation } from "react-i18next";
import PaymentsTabHeaderJSX, {
  type PaymentsTabHeaderJSXProps,
} from "./PaymentsTabHeaderJSX";

/** Refresh's look while it shows: off during any request, turning on its own. */
export interface RefreshButtonState {
  isDisabled: boolean;
  isRefreshing: boolean;
}

export interface PaymentsTabHeaderProps {
  // Null while there is nothing to refresh: the list is loading, or its
  // first load failed and the tab offers Retry instead.
  refreshButtonState: RefreshButtonState | null;
  handleRefresh: () => void;
}

const PaymentsTabHeader: FC<PaymentsTabHeaderProps> = ({
  refreshButtonState,
  handleRefresh,
}) => {
  const { t } = useTranslation("till");

  let refreshButton: PaymentsTabHeaderJSXProps["refreshButton"] = null;
  if (refreshButtonState !== null) {
    refreshButton = {
      ...refreshButtonState,
      label: refreshButtonState.isRefreshing
        ? t("home.payments.refreshing")
        : t("home.payments.refresh"),
    };
  }

  return (
    <PaymentsTabHeaderJSX
      refreshButton={refreshButton}
      handleRefresh={handleRefresh}
    />
  );
};

export default PaymentsTabHeader;

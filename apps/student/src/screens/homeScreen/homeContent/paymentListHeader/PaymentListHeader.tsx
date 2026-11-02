import type { FC } from "react";
import { useTranslation } from "react-i18next";
import PaymentListHeaderJSX, {
  type PaymentListHeaderJSXProps,
} from "./PaymentListHeaderJSX";

/** Refresh's look while it shows: off during any request, turning on its own. */
export interface RefreshButtonState {
  isDisabled: boolean;
  isRefreshing: boolean;
}

export interface PaymentListHeaderProps {
  headingId: string;
  // Null while there is nothing to refresh: the list is loading, or its
  // first load failed and the screen offers Retry instead.
  refreshButtonState: RefreshButtonState | null;
  handleRefresh: () => void;
}

const PaymentListHeader: FC<PaymentListHeaderProps> = ({
  headingId,
  refreshButtonState,
  handleRefresh,
}) => {
  const { t } = useTranslation("student");

  let refreshButton: PaymentListHeaderJSXProps["refreshButton"] = null;
  if (refreshButtonState !== null) {
    refreshButton = {
      ...refreshButtonState,
      label: refreshButtonState.isRefreshing
        ? t("home.payments.refreshing")
        : t("home.payments.refresh"),
    };
  }

  return (
    <PaymentListHeaderJSX
      headingId={headingId}
      refreshButton={refreshButton}
      handleRefresh={handleRefresh}
    />
  );
};

export default PaymentListHeader;

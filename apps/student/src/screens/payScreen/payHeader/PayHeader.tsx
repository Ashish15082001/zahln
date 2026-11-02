import type { FC, Ref } from "react";
import { useTranslation } from "react-i18next";
import PayHeaderJSX, { type PayHeaderJSXProps } from "./PayHeaderJSX";

/** Whether Refresh shows, and whether it is fetching. */
export type RefreshButtonStatus = "hidden" | "idle" | "refreshing";

export interface PayHeaderProps {
  headingRef: Ref<HTMLHeadingElement>;
  refreshButtonStatus: RefreshButtonStatus;
  handleGoHome: () => void;
  handleRefreshPayment: () => void;
}

const PayHeader: FC<PayHeaderProps> = ({
  headingRef,
  refreshButtonStatus,
  handleGoHome,
  handleRefreshPayment,
}) => {
  const { t } = useTranslation("student");

  // Off while it turns, so a second tap can't start a second request.
  let refreshButton: PayHeaderJSXProps["refreshButton"] = null;
  if (refreshButtonStatus !== "hidden") {
    const isRefreshing = refreshButtonStatus === "refreshing";
    refreshButton = {
      isDisabled: isRefreshing,
      isRefreshing,
      label: isRefreshing
        ? t("pay.ownPayment.refreshing")
        : t("pay.ownPayment.refresh"),
    };
  }

  return (
    <PayHeaderJSX
      headingRef={headingRef}
      refreshButton={refreshButton}
      handleGoHome={handleGoHome}
      handleRefreshPayment={handleRefreshPayment}
    />
  );
};

export default PayHeader;

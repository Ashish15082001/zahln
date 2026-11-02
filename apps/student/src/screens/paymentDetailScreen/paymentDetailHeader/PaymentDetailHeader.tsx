import type { FC, Ref } from "react";
import { useTranslation } from "react-i18next";
import PaymentDetailHeaderJSX, {
  type PaymentDetailHeaderJSXProps,
} from "./PaymentDetailHeaderJSX";

/** Whether Refresh shows, and whether it is fetching. */
export type RefreshButtonStatus = "hidden" | "idle" | "refreshing";

export interface PaymentDetailHeaderProps {
  headingRef: Ref<HTMLHeadingElement>;
  refreshButtonStatus: RefreshButtonStatus;
  handleBack: () => void;
  handleRefresh: () => void;
}

const PaymentDetailHeader: FC<PaymentDetailHeaderProps> = ({
  headingRef,
  refreshButtonStatus,
  handleBack,
  handleRefresh,
}) => {
  const { t } = useTranslation("student");

  // Off while it turns, so a second tap can't start a second request.
  let refreshButton: PaymentDetailHeaderJSXProps["refreshButton"] = null;
  if (refreshButtonStatus !== "hidden") {
    const isRefreshing = refreshButtonStatus === "refreshing";
    refreshButton = {
      isDisabled: isRefreshing,
      isRefreshing,
      label: isRefreshing
        ? t("paymentDetail.refreshing")
        : t("paymentDetail.refresh"),
    };
  }

  return (
    <PaymentDetailHeaderJSX
      headingRef={headingRef}
      refreshButton={refreshButton}
      handleBack={handleBack}
      handleRefresh={handleRefresh}
    />
  );
};

export default PaymentDetailHeader;

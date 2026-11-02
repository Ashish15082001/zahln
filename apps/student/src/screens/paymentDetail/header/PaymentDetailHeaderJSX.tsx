import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@zahln/ui/components/button";
import RefreshButtonJSX from "@zahln/ui/components/refreshButton/RefreshButtonJSX";
import type { FC, Ref } from "react";
import { useTranslation } from "react-i18next";

/** Whether Refresh shows, and whether it is fetching. */
export type RefreshButtonStatus = "hidden" | "idle" | "refreshing";

export interface PaymentDetailHeaderJSXProps {
  headingRef: Ref<HTMLHeadingElement>;
  refreshButtonStatus: RefreshButtonStatus;
  handleBack: () => void;
  handleRefresh: () => void;
}

// The title under Back and Refresh, as on every screen with Back.
const PaymentDetailHeaderJSX: FC<PaymentDetailHeaderJSXProps> = ({
  headingRef,
  refreshButtonStatus,
  handleBack,
  handleRefresh,
}) => {
  const { t } = useTranslation("student");

  const isRefreshing = refreshButtonStatus === "refreshing";
  const refreshLabel = isRefreshing
    ? t("paymentDetail.refreshing")
    : t("paymentDetail.refresh");

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <Button variant="outline" onClick={handleBack}>
          <HugeiconsIcon aria-hidden icon={ArrowLeft01Icon} />
          {t("paymentDetail.back")}
        </Button>
        {refreshButtonStatus !== "hidden" && (
          <RefreshButtonJSX
            isDisabled={isRefreshing}
            isRefreshing={isRefreshing}
            label={refreshLabel}
            handleRefresh={handleRefresh}
          />
        )}
      </div>
      {/* tabIndex -1 so the screen can move focus here on open; it isn't in
          the Tab order. No outline: it is a heading, not a control. */}
      <h1
        ref={headingRef}
        className="text-2xl font-semibold outline-none"
        tabIndex={-1}
      >
        {t("paymentDetail.title")}
      </h1>
    </>
  );
};

export default PaymentDetailHeaderJSX;

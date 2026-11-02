import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@zahln/ui/components/button";
import RefreshButtonJSX from "@zahln/ui/components/refreshButton/RefreshButtonJSX";
import type { FC, Ref } from "react";
import { useTranslation } from "react-i18next";

/** Whether Refresh shows, and whether it is fetching. */
export type RefreshButtonStatus = "hidden" | "idle" | "refreshing";

export interface PayHeaderJSXProps {
  headingRef: Ref<HTMLHeadingElement>;
  refreshButtonStatus: RefreshButtonStatus;
  handleGoHome: () => void;
  handleRefreshPayment: () => void;
}

const PayHeaderJSX: FC<PayHeaderJSXProps> = ({
  headingRef,
  refreshButtonStatus,
  handleGoHome,
  handleRefreshPayment,
}) => {
  const { t } = useTranslation("student");

  const isRefreshing = refreshButtonStatus === "refreshing";
  const refreshLabel = isRefreshing
    ? t("pay.ownPayment.refreshing")
    : t("pay.ownPayment.refresh");

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <Button variant="outline" onClick={handleGoHome}>
          <HugeiconsIcon aria-hidden icon={ArrowLeft01Icon} />
          {t("pay.back")}
        </Button>
        {/* At the right of Back, as on the payment's detail, so the footer
            keeps two buttons side by side. */}
        {refreshButtonStatus !== "hidden" && (
          <RefreshButtonJSX
            isDisabled={isRefreshing}
            isRefreshing={isRefreshing}
            label={refreshLabel}
            handleRefresh={handleRefreshPayment}
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
        {t("pay.title")}
      </h1>
    </>
  );
};

export default PayHeaderJSX;

import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@zahln/ui/components/button";
import RefreshButtonJSX, {
  type RefreshButtonJSXProps,
} from "@zahln/ui/components/refreshButton/RefreshButtonJSX";
import type { FC, Ref } from "react";
import { useTranslation } from "react-i18next";

export interface PayHeaderJSXProps {
  headingRef: Ref<HTMLHeadingElement>;
  // Null while it is hidden.
  refreshButton: Omit<RefreshButtonJSXProps, "handleRefresh"> | null;
  handleGoHome: () => void;
  handleRefreshPayment: () => void;
}

const PayHeaderJSX: FC<PayHeaderJSXProps> = ({
  headingRef,
  refreshButton,
  handleGoHome,
  handleRefreshPayment,
}) => {
  const { t } = useTranslation("student");

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <Button variant="outline" onClick={handleGoHome}>
          <HugeiconsIcon aria-hidden icon={ArrowLeft01Icon} />
          {t("pay.back")}
        </Button>
        {/* At the right of Back, as on the payment's detail, so the footer
            keeps two buttons side by side. */}
        {refreshButton !== null && (
          <RefreshButtonJSX
            isDisabled={refreshButton.isDisabled}
            isRefreshing={refreshButton.isRefreshing}
            label={refreshButton.label}
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

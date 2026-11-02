import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@zahln/ui/components/button";
import RefreshButtonJSX, {
  type RefreshButtonJSXProps,
} from "@zahln/ui/components/refreshButton/RefreshButtonJSX";
import type { FC, Ref } from "react";
import { useTranslation } from "react-i18next";

export interface PaymentDetailHeaderJSXProps {
  headingRef: Ref<HTMLHeadingElement>;
  // Null while it is hidden.
  refreshButton: Omit<RefreshButtonJSXProps, "handleRefresh"> | null;
  handleBack: () => void;
  handleRefresh: () => void;
}

// The title under Back and Refresh, as on every screen with Back.
const PaymentDetailHeaderJSX: FC<PaymentDetailHeaderJSXProps> = ({
  headingRef,
  refreshButton,
  handleBack,
  handleRefresh,
}) => {
  const { t } = useTranslation("student");

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <Button variant="outline" onClick={handleBack}>
          <HugeiconsIcon aria-hidden icon={ArrowLeft01Icon} />
          {t("paymentDetail.back")}
        </Button>
        {refreshButton !== null && (
          <RefreshButtonJSX
            isDisabled={refreshButton.isDisabled}
            isRefreshing={refreshButton.isRefreshing}
            label={refreshButton.label}
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

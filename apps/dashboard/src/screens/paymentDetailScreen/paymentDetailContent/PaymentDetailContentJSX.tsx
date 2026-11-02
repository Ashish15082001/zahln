import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@zahln/ui/components/button";
import type { FC, Ref } from "react";
import { useTranslation } from "react-i18next";
import ScreenTitleRow, {
  type RefreshButtonState,
} from "../../../components/screenTitleRow/ScreenTitleRow";
import PaymentDetailReport from "./paymentDetailReport/PaymentDetailReport";
import type { PaymentDetailState } from "./paymentDetailReport/PaymentDetailReportJSX";

export interface PaymentDetailContentJSXProps {
  headingRef: Ref<HTMLHeadingElement>;
  paymentId: string;
  // Null while there is nothing to refresh.
  refreshButtonState: RefreshButtonState | null;
  state: PaymentDetailState;
  title: string;
  handleBack: () => void;
  handleRefresh: () => void;
}

const PaymentDetailContentJSX: FC<PaymentDetailContentJSXProps> = ({
  headingRef,
  paymentId,
  refreshButtonState,
  state,
  title,
  handleBack,
  handleRefresh,
}) => {
  const { t } = useTranslation("dashboard");

  return (
    <>
      {/* self-start, so it keeps its own width in the page's column. */}
      <Button
        className="self-start"
        type="button"
        variant="outline"
        onClick={handleBack}
      >
        <HugeiconsIcon aria-hidden icon={ArrowLeft01Icon} />
        {t("paymentDetail.back")}
      </Button>
      {/* The id from the URL, shown before the payment loads and when it
          isn't found, so finance can see which one was asked for. */}
      <ScreenTitleRow
        description={paymentId}
        headingRef={headingRef}
        refreshButtonState={refreshButtonState}
        title={title}
        handleRefresh={handleRefresh}
      />
      <PaymentDetailReport state={state} handleRefresh={handleRefresh} />
    </>
  );
};

export default PaymentDetailContentJSX;

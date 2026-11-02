import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import type { FC, Ref } from "react";
import PaymentDetailContent from "./paymentDetailContent/PaymentDetailContent";
import type { PaymentDetailState } from "./paymentDetailContent/PaymentDetailContentJSX";
import PaymentDetailHeader, {
  type RefreshButtonStatus,
} from "./paymentDetailHeader/PaymentDetailHeader";

export interface PaymentDetailScreenJSXProps {
  headingRef: Ref<HTMLHeadingElement>;
  refreshButtonStatus: RefreshButtonStatus;
  state: PaymentDetailState;
  handleBack: () => void;
  handleRefresh: () => void;
}

const PaymentDetailScreenJSX: FC<PaymentDetailScreenJSXProps> = ({
  headingRef,
  refreshButtonStatus,
  state,
  handleBack,
  handleRefresh,
}) => (
  <ScreenLayoutJSX
    columnWidth="md"
    content={
      <PaymentDetailContent state={state} handleRefresh={handleRefresh} />
    }
    header={
      <PaymentDetailHeader
        headingRef={headingRef}
        refreshButtonStatus={refreshButtonStatus}
        handleBack={handleBack}
        handleRefresh={handleRefresh}
      />
    }
  />
);

export default PaymentDetailScreenJSX;

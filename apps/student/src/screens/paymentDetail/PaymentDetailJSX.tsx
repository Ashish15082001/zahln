import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import type { FC, Ref } from "react";
import PaymentDetailContentJSX, {
  type PaymentDetailState,
} from "./content/PaymentDetailContentJSX";
import PaymentDetailHeaderJSX, {
  type RefreshButtonStatus,
} from "./header/PaymentDetailHeaderJSX";

export interface PaymentDetailJSXProps {
  headingRef: Ref<HTMLHeadingElement>;
  refreshButtonStatus: RefreshButtonStatus;
  state: PaymentDetailState;
  handleBack: () => void;
  handleRefresh: () => void;
}

const PaymentDetailJSX: FC<PaymentDetailJSXProps> = ({
  headingRef,
  refreshButtonStatus,
  state,
  handleBack,
  handleRefresh,
}) => (
  <ScreenLayoutJSX
    columnWidth="md"
    content={
      <PaymentDetailContentJSX state={state} handleRefresh={handleRefresh} />
    }
    header={
      <PaymentDetailHeaderJSX
        headingRef={headingRef}
        refreshButtonStatus={refreshButtonStatus}
        handleBack={handleBack}
        handleRefresh={handleRefresh}
      />
    }
  />
);

export default PaymentDetailJSX;

import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import type { FC, Ref } from "react";
import PayContentJSX, { type PayScreenState } from "./payContent/PayContentJSX";
import PayFooterJSX, { type PayFooterState } from "./payFooter/PayFooterJSX";
import PayHeaderJSX, {
  type RefreshButtonStatus,
} from "./payHeader/PayHeaderJSX";

export interface PayScreenJSXProps {
  headingRef: Ref<HTMLHeadingElement>;
  // Null when the screen has no footer: it then has its own Done.
  payFooterState: PayFooterState | null;
  refreshButtonStatus: RefreshButtonStatus;
  // The heading of the payer's own payment, where focus goes on each answer.
  resultHeadingRef: Ref<HTMLHeadingElement>;
  state: PayScreenState;
  handleGoHome: () => void;
  handlePay: () => void;
  handleRefreshPayment: () => void;
  handleRetry: () => void;
  handleTimeUp: () => void;
}

const PayScreenJSX: FC<PayScreenJSXProps> = ({
  headingRef,
  payFooterState,
  refreshButtonStatus,
  resultHeadingRef,
  state,
  handleGoHome,
  handlePay,
  handleRefreshPayment,
  handleRetry,
  handleTimeUp,
}) => (
  <ScreenLayoutJSX
    columnWidth="md"
    content={
      <PayContentJSX
        resultHeadingRef={resultHeadingRef}
        state={state}
        handleGoHome={handleGoHome}
        handleRetry={handleRetry}
        handleTimeUp={handleTimeUp}
      />
    }
    // Undefined, not a footer that renders nothing: the layout drops the
    // footer bar only when it gets none.
    footer={
      payFooterState === null ? undefined : (
        <PayFooterJSX
          payFooterState={payFooterState}
          handleDone={handleGoHome}
          handlePay={handlePay}
        />
      )
    }
    header={
      <PayHeaderJSX
        headingRef={headingRef}
        refreshButtonStatus={refreshButtonStatus}
        handleGoHome={handleGoHome}
        handleRefreshPayment={handleRefreshPayment}
      />
    }
  />
);

export default PayScreenJSX;

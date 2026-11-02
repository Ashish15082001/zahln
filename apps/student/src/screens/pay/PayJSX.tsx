import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import type { FC, ReactElement, Ref } from "react";
import PayContentJSX, { type PayScreenState } from "./content/PayContentJSX";
import OwnPaymentFooterJSX from "./footer/ownPaymentFooter/OwnPaymentFooterJSX";
import PayFooter, { type PayFooterState } from "./footer/payFooter/PayFooter";
import PayHeaderJSX, { type RefreshButtonStatus } from "./header/PayHeaderJSX";

export interface PayJSXProps {
  headingRef: Ref<HTMLHeadingElement>;
  // Null once the order can't be paid.
  payFooter: PayFooterState | null;
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

const PayJSX: FC<PayJSXProps> = ({
  headingRef,
  payFooter,
  refreshButtonStatus,
  resultHeadingRef,
  state,
  handleGoHome,
  handlePay,
  handleRefreshPayment,
  handleRetry,
  handleTimeUp,
}) => {
  // Pay until the order can't be paid, then the payer's own result's
  // buttons in its place. Neither for someone else's or a missing order:
  // the screen then has its own Done. Chosen here, not inside one footer
  // component: the layout drops the footer bar only when it gets none.
  let footer: ReactElement | undefined;
  if (payFooter !== null) {
    footer = (
      <PayFooter
        amountCents={payFooter.amountCents}
        isPayable={payFooter.isPayable}
        payStatus={payFooter.payStatus}
        handleDone={handleGoHome}
        handlePay={handlePay}
      />
    );
  } else if (state.status === "ownPayment") {
    footer = (
      <OwnPaymentFooterJSX
        paymentPath={state.paymentPath}
        handleDone={handleGoHome}
      />
    );
  }

  return (
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
      footer={footer}
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
};

export default PayJSX;

import type { FC } from "react";
import OwnPaymentFooter from "./ownPaymentFooter/OwnPaymentFooter";
import PayButtonFooter, {
  type PayButtonFooterState,
} from "./payButtonFooter/PayButtonFooter";

/**
 * Which footer the pay screen shows: Pay until the order can't be paid, then
 * the payer's own result's buttons in its place.
 */
export type PayFooterState =
  | { status: "payButton"; payButtonFooter: PayButtonFooterState }
  | { status: "ownPayment"; paymentPath: string };

export interface PayFooterJSXProps {
  payFooterState: PayFooterState;
  handleDone: () => void;
  handlePay: () => void;
}

const PayFooterJSX: FC<PayFooterJSXProps> = ({
  payFooterState,
  handleDone,
  handlePay,
}) => {
  if (payFooterState.status === "ownPayment") {
    return (
      <OwnPaymentFooter
        paymentPath={payFooterState.paymentPath}
        handleDone={handleDone}
      />
    );
  }

  const { payButtonFooter } = payFooterState;

  return (
    <PayButtonFooter
      amountCents={payButtonFooter.amountCents}
      isPayable={payButtonFooter.isPayable}
      payStatus={payButtonFooter.payStatus}
      handleDone={handleDone}
      handlePay={handlePay}
    />
  );
};

export default PayFooterJSX;

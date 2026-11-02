import type { FC } from "react";
import { toPaymentPath } from "../../../../app/paths";
import PaymentIdCellJSX from "./PaymentIdCellJSX";

export interface PaymentIdCellProps {
  orderId: string;
  paymentId: string;
}

const PaymentIdCell: FC<PaymentIdCellProps> = ({ orderId, paymentId }) => {
  const paymentPath = toPaymentPath(paymentId);

  return (
    <PaymentIdCellJSX
      orderId={orderId}
      paymentId={paymentId}
      paymentPath={paymentPath}
    />
  );
};

export default PaymentIdCell;

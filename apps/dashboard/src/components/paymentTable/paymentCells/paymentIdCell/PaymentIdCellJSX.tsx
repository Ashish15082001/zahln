import type { FC } from "react";

export interface PaymentIdCellJSXProps {
  orderId: string;
  paymentId: string;
}

// Both ids in full, in a monospace font, so they can be read out to support
// or copied into the search exactly. The payment's first, since it is the
// one finance asks about.
const PaymentIdCellJSX: FC<PaymentIdCellJSXProps> = ({
  orderId,
  paymentId,
}) => (
  <div className="flex flex-col font-mono text-xs">
    <span>{paymentId}</span>
    <span className="text-muted-foreground">{orderId}</span>
  </div>
);

export default PaymentIdCellJSX;

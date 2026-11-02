import type { FC } from "react";
import { Link } from "react-router";

export interface PaymentIdCellJSXProps {
  orderId: string;
  paymentId: string;
  paymentPath: string;
}

// Both ids in full, in a monospace font, so they can be read out to support
// or copied into the search exactly. The payment's is the link to its detail:
// a real link, so it opens in a new tab too, and a screen reader's list of
// links names each payment.
const PaymentIdCellJSX: FC<PaymentIdCellJSXProps> = ({
  orderId,
  paymentId,
  paymentPath,
}) => (
  <div className="flex flex-col font-mono text-xs">
    <Link
      className="font-medium text-primary underline underline-offset-4"
      to={paymentPath}
    >
      {paymentId}
    </Link>
    <span className="text-muted-foreground">{orderId}</span>
  </div>
);

export default PaymentIdCellJSX;

import type { FC } from "react";

export interface PayerCellJSXProps {
  payerName: string;
}

// Table cells don't wrap, so a long name would make the table wider than the
// screen. This one does, down to a width that stays readable.
const PayerCellJSX: FC<PayerCellJSXProps> = ({ payerName }) => (
  <div className="min-w-24 whitespace-normal">{payerName}</div>
);

export default PayerCellJSX;

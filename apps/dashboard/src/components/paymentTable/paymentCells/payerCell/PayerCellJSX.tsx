import type { FC } from "react";

export interface PayerCellJSXProps {
  payerId: string;
  payerName: string;
}

// The name, then the id, which is what the search takes. The name wraps,
// down to a width that stays readable, so a long one doesn't widen the table.
const PayerCellJSX: FC<PayerCellJSXProps> = ({ payerId, payerName }) => (
  <div className="flex min-w-28 flex-col whitespace-normal">
    <span>{payerName}</span>
    <span className="font-mono text-xs text-muted-foreground">{payerId}</span>
  </div>
);

export default PayerCellJSX;

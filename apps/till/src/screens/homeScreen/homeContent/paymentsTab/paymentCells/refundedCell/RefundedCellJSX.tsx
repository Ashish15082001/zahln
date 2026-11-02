import type { FC } from "react";

export interface RefundedCellJSXProps {
  // Null when nothing is on its way back.
  pendingRefund: string | null;
  // Null when nothing went back yet.
  refundedAmount: string | null;
}

// What went back to the payer, and what is still on its way. Empty for most
// payments, which have no refund at all.
const RefundedCellJSX: FC<RefundedCellJSXProps> = ({
  pendingRefund,
  refundedAmount,
}) => (
  <div className="flex flex-col items-end tabular-nums">
    {refundedAmount !== null && <span>{refundedAmount}</span>}
    {pendingRefund !== null && (
      <span className="text-muted-foreground">{pendingRefund}</span>
    )}
  </div>
);

export default RefundedCellJSX;

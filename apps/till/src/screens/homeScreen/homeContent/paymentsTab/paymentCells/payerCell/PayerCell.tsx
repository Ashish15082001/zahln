import type { FC } from "react";
import PayerCellJSX, { type PayerCellJSXProps } from "./PayerCellJSX";

export type PayerCellProps = PayerCellJSXProps;

// Nothing to work out: it shows what it is handed, so the props pass
// straight through to the markup.
const PayerCell: FC<PayerCellProps> = (props) => <PayerCellJSX {...props} />;

export default PayerCell;

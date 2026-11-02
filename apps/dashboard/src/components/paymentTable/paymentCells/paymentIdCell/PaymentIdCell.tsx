import type { FC } from "react";
import PaymentIdCellJSX, {
  type PaymentIdCellJSXProps,
} from "./PaymentIdCellJSX";

export type PaymentIdCellProps = PaymentIdCellJSXProps;

// Nothing to work out: it shows what it is handed, so the props pass
// straight through to the markup.
const PaymentIdCell: FC<PaymentIdCellProps> = (props) => (
  <PaymentIdCellJSX {...props} />
);

export default PaymentIdCell;

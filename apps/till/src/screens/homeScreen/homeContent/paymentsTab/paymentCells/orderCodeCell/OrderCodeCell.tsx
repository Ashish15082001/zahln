import type { FC } from "react";
import OrderCodeCellJSX, {
  type OrderCodeCellJSXProps,
} from "./OrderCodeCellJSX";

export type OrderCodeCellProps = OrderCodeCellJSXProps;

// Nothing to work out: it shows what it is handed, so the props pass
// straight through to the markup.
const OrderCodeCell: FC<OrderCodeCellProps> = (props) => (
  <OrderCodeCellJSX {...props} />
);

export default OrderCodeCell;

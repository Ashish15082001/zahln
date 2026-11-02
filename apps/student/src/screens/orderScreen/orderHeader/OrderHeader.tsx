import type { FC } from "react";
import OrderHeaderJSX, { type OrderHeaderJSXProps } from "./OrderHeaderJSX";

export type OrderHeaderProps = OrderHeaderJSXProps;

// Nothing to work out: it shows what it is handed, so the props pass
// straight through to the markup.
const OrderHeader: FC<OrderHeaderProps> = (props) => (
  <OrderHeaderJSX {...props} />
);

export default OrderHeader;

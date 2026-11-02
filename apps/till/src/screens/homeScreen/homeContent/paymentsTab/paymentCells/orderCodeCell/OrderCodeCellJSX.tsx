import type { FC } from "react";

export interface OrderCodeCellJSXProps {
  orderId: string;
}

// Monospace, like the code under the QR, so the two are easy to match.
const OrderCodeCellJSX: FC<OrderCodeCellJSXProps> = ({ orderId }) => (
  <span className="font-mono">{orderId}</span>
);

export default OrderCodeCellJSX;

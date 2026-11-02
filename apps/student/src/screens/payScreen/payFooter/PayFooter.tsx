import type { FC } from "react";
import PayFooterJSX, { type PayFooterJSXProps } from "./PayFooterJSX";

export type PayFooterProps = PayFooterJSXProps;

// Nothing to work out: it shows what it is handed, so the props pass
// straight through to the markup.
const PayFooter: FC<PayFooterProps> = (props) => <PayFooterJSX {...props} />;

export default PayFooter;

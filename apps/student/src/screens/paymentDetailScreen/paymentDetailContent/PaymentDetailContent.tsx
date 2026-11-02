import type { FC } from "react";
import PaymentDetailContentJSX, {
  type PaymentDetailContentJSXProps,
} from "./PaymentDetailContentJSX";

export type PaymentDetailContentProps = PaymentDetailContentJSXProps;

// Nothing to work out: it shows what it is handed, so the props pass
// straight through to the markup.
const PaymentDetailContent: FC<PaymentDetailContentProps> = (props) => (
  <PaymentDetailContentJSX {...props} />
);

export default PaymentDetailContent;

import type { FC } from "react";
import OwnPaymentFooterJSX, {
  type OwnPaymentFooterJSXProps,
} from "./OwnPaymentFooterJSX";

export type OwnPaymentFooterProps = OwnPaymentFooterJSXProps;

// Nothing to work out: it shows what it is handed, so the props pass
// straight through to the markup.
const OwnPaymentFooter: FC<OwnPaymentFooterProps> = (props) => (
  <OwnPaymentFooterJSX {...props} />
);

export default OwnPaymentFooter;

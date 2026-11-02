import type { FC } from "react";
import PaymentDetailReportJSX, {
  type PaymentDetailReportJSXProps,
} from "./PaymentDetailReportJSX";

export type PaymentDetailReportProps = PaymentDetailReportJSXProps;

// Nothing to work out: PaymentDetailContent hands over the state ready to
// show.
const PaymentDetailReport: FC<PaymentDetailReportProps> = (props) => (
  <PaymentDetailReportJSX {...props} />
);

export default PaymentDetailReport;

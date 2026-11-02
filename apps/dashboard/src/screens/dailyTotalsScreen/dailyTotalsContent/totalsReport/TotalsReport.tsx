import type { FC } from "react";
import TotalsReportJSX, { type TotalsReportJSXProps } from "./TotalsReportJSX";

export type TotalsReportProps = TotalsReportJSXProps;

// Nothing to work out: DailyTotalsContent hands over the state ready to show.
const TotalsReport: FC<TotalsReportProps> = (props) => (
  <TotalsReportJSX {...props} />
);

export default TotalsReport;

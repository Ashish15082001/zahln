import type { FC } from "react";
import type { OwnPaymentStatus } from "../ownPayment/OwnPayment";
import OwnPaymentFooterJSX from "./OwnPaymentFooterJSX";

export interface OwnPaymentFooterProps {
  isRefreshing: boolean;
  paymentPath: string;
  paymentStatus: OwnPaymentStatus;
  handleDone: () => void;
  handleRefresh: () => void;
}

const OwnPaymentFooter: FC<OwnPaymentFooterProps> = ({
  isRefreshing,
  paymentPath,
  paymentStatus,
  handleDone,
  handleRefresh,
}) => (
  <OwnPaymentFooterJSX
    // Only once the page has stopped asking on its own.
    isRefreshShown={paymentStatus === "longPending"}
    isRefreshing={isRefreshing}
    paymentPath={paymentPath}
    handleDone={handleDone}
    handleRefresh={handleRefresh}
  />
);

export default OwnPaymentFooter;

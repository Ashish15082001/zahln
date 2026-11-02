import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import type { FC } from "react";
import DashboardHeader from "../../components/dashboardHeader/DashboardHeader";
import PaymentDetailContent from "./paymentDetailContent/PaymentDetailContent";

const PaymentDetailScreenJSX: FC = () => (
  <ScreenLayoutJSX
    columnWidth="7xl"
    content={<PaymentDetailContent />}
    header={<DashboardHeader />}
  />
);

export default PaymentDetailScreenJSX;

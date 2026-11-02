import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import type { FC } from "react";
import DashboardHeader from "../../components/dashboardHeader/DashboardHeader";
import PaymentsContent from "./paymentsContent/PaymentsContent";

const PaymentsScreenJSX: FC = () => (
  <ScreenLayoutJSX
    columnWidth="7xl"
    content={<PaymentsContent />}
    header={<DashboardHeader />}
  />
);

export default PaymentsScreenJSX;

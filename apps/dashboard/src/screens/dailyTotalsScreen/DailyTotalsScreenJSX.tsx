import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import type { FC } from "react";
import DashboardHeader from "../../components/dashboardHeader/DashboardHeader";
import DailyTotalsContent from "./dailyTotalsContent/DailyTotalsContent";

const DailyTotalsScreenJSX: FC = () => (
  <ScreenLayoutJSX
    columnWidth="5xl"
    content={<DailyTotalsContent />}
    header={<DashboardHeader />}
  />
);

export default DailyTotalsScreenJSX;

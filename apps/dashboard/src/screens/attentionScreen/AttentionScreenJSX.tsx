import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import type { FC } from "react";
import DashboardHeader from "../../components/dashboardHeader/DashboardHeader";
import AttentionContent from "./attentionContent/AttentionContent";

const AttentionScreenJSX: FC = () => (
  <ScreenLayoutJSX
    columnWidth="7xl"
    content={<AttentionContent />}
    header={<DashboardHeader />}
  />
);

export default AttentionScreenJSX;

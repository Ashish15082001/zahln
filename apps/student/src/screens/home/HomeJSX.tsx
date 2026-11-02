import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import type { FC } from "react";
import PaymentList from "./content/PaymentList";
import ScanFooter from "./footer/ScanFooter";
import HomeHeader from "./header/HomeHeader";

const HomeJSX: FC = () => (
  <ScreenLayoutJSX
    columnWidth="md"
    content={<PaymentList />}
    footer={<ScanFooter />}
    header={<HomeHeader />}
  />
);

export default HomeJSX;

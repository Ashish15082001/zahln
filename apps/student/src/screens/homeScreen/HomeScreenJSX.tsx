import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import type { FC } from "react";
import HomeContent from "./homeContent/HomeContent";
import HomeFooter from "./homeFooter/HomeFooter";
import HomeHeader from "./homeHeader/HomeHeader";

const HomeScreenJSX: FC = () => (
  <ScreenLayoutJSX
    columnWidth="full"
    content={<HomeContent />}
    footer={<HomeFooter />}
    header={<HomeHeader />}
  />
);

export default HomeScreenJSX;

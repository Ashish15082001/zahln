import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import type { FC } from "react";
import WelcomeContentJSX from "./content/WelcomeContentJSX";

export interface WelcomeJSXProps {
  appVersion: string;
}

const WelcomeJSX: FC<WelcomeJSXProps> = ({ appVersion }) => (
  <ScreenLayoutJSX
    columnWidth="md"
    content={<WelcomeContentJSX appVersion={appVersion} />}
    contentClassName="items-center justify-center gap-4"
  />
);

export default WelcomeJSX;

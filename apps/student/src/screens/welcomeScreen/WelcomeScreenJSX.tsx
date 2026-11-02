import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import type { FC } from "react";
import WelcomeContentJSX from "./welcomeContent/WelcomeContentJSX";

export interface WelcomeScreenJSXProps {
  appVersion: string;
}

const WelcomeScreenJSX: FC<WelcomeScreenJSXProps> = ({ appVersion }) => (
  <ScreenLayoutJSX
    columnWidth="md"
    content={<WelcomeContentJSX appVersion={appVersion} />}
    contentClassName="items-center justify-center gap-4"
  />
);

export default WelcomeScreenJSX;

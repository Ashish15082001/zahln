import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import type { FC } from "react";
import WelcomeContent from "./welcomeContent/WelcomeContent";

export interface WelcomeScreenJSXProps {
  appVersion: string;
}

const WelcomeScreenJSX: FC<WelcomeScreenJSXProps> = ({ appVersion }) => (
  <ScreenLayoutJSX
    columnWidth="full"
    content={<WelcomeContent appVersion={appVersion} />}
    contentClassName="items-center justify-center gap-4"
  />
);

export default WelcomeScreenJSX;

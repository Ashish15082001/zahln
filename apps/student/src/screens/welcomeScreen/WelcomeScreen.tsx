import type { FC } from "react";
import { config } from "../../config";
import WelcomeScreenJSX from "./WelcomeScreenJSX";

const WelcomeScreen: FC = () => {
  return <WelcomeScreenJSX appVersion={config.appVersion} />;
};

export default WelcomeScreen;

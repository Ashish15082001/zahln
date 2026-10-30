import type { FC } from "react";
import { config } from "../../config";
import WelcomeJSX from "./WelcomeJSX";

const Welcome: FC = () => {
  return <WelcomeJSX appVersion={config.appVersion} />;
};

export default Welcome;

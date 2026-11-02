import type { FC } from "react";
import { useAppSession } from "../../../data/session";
import HomeHeaderJSX from "./HomeHeaderJSX";

// Only reached signed in: Home renders nothing otherwise. The guard below
// narrows the type.
const HomeHeader: FC = () => {
  const appSession = useAppSession();
  if (appSession.status !== "signedIn") return null;

  return <HomeHeaderJSX displayName={appSession.payer.displayName} />;
};

export default HomeHeader;

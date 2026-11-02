import type { FC } from "react";
import { useSession } from "../../../data/session";
import HomeHeaderJSX from "./HomeHeaderJSX";

// Only reached signed in: Home renders nothing otherwise. The guard below
// narrows the type.
const HomeHeader: FC = () => {
  const session = useSession();
  if (session.status !== "signedIn") return null;

  return <HomeHeaderJSX displayName={session.payer.displayName} />;
};

export default HomeHeader;

import type { FC } from "react";
import { logOut, useTillSession } from "../../../data/session";
import HomeHeaderJSX from "./HomeHeaderJSX";

// Only reached signed in: Home renders nothing otherwise. The guard below
// narrows the type.
const HomeHeader: FC = () => {
  const tillSession = useTillSession();
  if (tillSession.status !== "signedIn") return null;

  return (
    <HomeHeaderJSX
      displayName={tillSession.cashier.displayName}
      handleLogOut={logOut}
    />
  );
};

export default HomeHeader;

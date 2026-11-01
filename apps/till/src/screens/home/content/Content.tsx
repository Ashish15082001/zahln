import { useState, type FC } from "react";
import { logOut, useSession } from "../../../data/session";
import ContentJSX, { type HomeTab } from "./ContentJSX";

// Radix hands back any string; only the tabs the screen has are taken.
const isHomeTab = (value: string): value is HomeTab =>
  value === "mensa" || value === "payments";

const Content: FC = () => {
  const session = useSession();
  // Kept here rather than inside Tabs, so the Payments tab can tell it's on
  // screen: it fetches only then.
  const [selectedTab, setSelectedTab] = useState<HomeTab>("mensa");
  if (session.status !== "signedIn") return null;

  const handleSelectTab = (value: string): void => {
    if (isHomeTab(value)) setSelectedTab(value);
  };

  return (
    <ContentJSX
      displayName={session.cashier.displayName}
      selectedTab={selectedTab}
      handleLogOut={logOut}
      handleSelectTab={handleSelectTab}
    />
  );
};

export default Content;

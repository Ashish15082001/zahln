import { useState, type FC } from "react";
import { useSession } from "../../data/session";
import HomeScreenJSX, { type HomeTab } from "./HomeScreenJSX";

// Radix hands back any string; only the tabs the screen has are taken.
const isHomeTab = (value: string): value is HomeTab =>
  value === "mensa" || value === "payments";

// Only reached signed in: SignedInOnly sends anyone else to Login. The guard
// covers the render in which a log-out lands, so no part of Home shows then.
const HomeScreen: FC = () => {
  const session = useSession();
  // Kept here rather than inside Tabs, so the Payments tab can tell it's on
  // screen: it fetches only then.
  const [selectedTab, setSelectedTab] = useState<HomeTab>("mensa");
  // The node in the footer that the Mensa tab draws Create order into. Set
  // by a ref callback, so the tab hears when the footer comes and goes.
  const [createOrderSlot, setCreateOrderSlot] = useState<HTMLElement | null>(
    null,
  );
  if (session.status !== "signedIn") return null;

  const isMensaTabShown = selectedTab === "mensa";
  const isPaymentsTabShown = selectedTab === "payments";

  const handleSelectTab = (value: string): void => {
    if (isHomeTab(value)) setSelectedTab(value);
  };

  return (
    <HomeScreenJSX
      createOrderSlot={createOrderSlot}
      createOrderSlotRef={setCreateOrderSlot}
      isMensaTabShown={isMensaTabShown}
      isPaymentsTabShown={isPaymentsTabShown}
      selectedTab={selectedTab}
      handleSelectTab={handleSelectTab}
    />
  );
};

export default HomeScreen;

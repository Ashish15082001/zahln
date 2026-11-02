import type { FC } from "react";
import { useDashboardSession } from "../../data/session";
import DailyTotalsScreenJSX from "./DailyTotalsScreenJSX";

// Only reached signed in: SignedInOnly sends anyone else to Login. The guard
// covers the render in which a log-out lands, so no part of the screen shows
// then.
const DailyTotalsScreen: FC = () => {
  const dashboardSession = useDashboardSession();
  if (dashboardSession.status !== "signedIn") return null;

  return <DailyTotalsScreenJSX />;
};

export default DailyTotalsScreen;

import type { FC } from "react";
import { useDashboardSession } from "../../data/session";
import AttentionScreenJSX from "./AttentionScreenJSX";

// Only reached signed in: SignedInOnly sends anyone else to Login. The guard
// covers the render in which a log-out lands, so no part of the screen shows
// then.
const AttentionScreen: FC = () => {
  const dashboardSession = useDashboardSession();
  if (dashboardSession.status !== "signedIn") return null;

  return <AttentionScreenJSX />;
};

export default AttentionScreen;

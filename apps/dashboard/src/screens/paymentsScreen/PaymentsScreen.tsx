import type { FC } from "react";
import { useDashboardSession } from "../../data/session";
import PaymentsScreenJSX from "./PaymentsScreenJSX";

// Only reached signed in: SignedInOnly sends anyone else to Login. The guard
// covers the render in which a log-out lands, so no part of the screen shows
// then.
const PaymentsScreen: FC = () => {
  const dashboardSession = useDashboardSession();
  if (dashboardSession.status !== "signedIn") return null;

  return <PaymentsScreenJSX />;
};

export default PaymentsScreen;

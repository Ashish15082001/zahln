import type { FC } from "react";
import { Navigate, Outlet } from "react-router";
import { useDashboardSession } from "../../data/session";
import { paths } from "../paths";

/**
 * Wraps the screen for someone not yet signed in: Login. A signed-in finance
 * user goes to the daily totals instead, both on a reload with a kept login
 * and right after logging in.
 *
 * A component, not a route loader: a loader runs only on navigation, and a
 * login changes the session without one. useDashboardSession re-renders this
 * on every change, so the redirect follows.
 */
const SignedOutOnly: FC = () => {
  const dashboardSession = useDashboardSession();
  if (dashboardSession.status === "signedIn") {
    return <Navigate replace to={paths.dailyTotals} />;
  }

  return <Outlet />;
};

export default SignedOutOnly;

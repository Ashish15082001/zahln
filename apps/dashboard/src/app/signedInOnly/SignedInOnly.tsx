import type { FC } from "react";
import { Navigate, Outlet, ScrollRestoration } from "react-router";
import { useDashboardSession } from "../../data/session";
import { paths } from "../paths";

/**
 * Wraps the screens that need a signed-in finance user: every screen but
 * Login. Anyone else goes to Login, whether the token ran out after a reload
 * or the session ended while the tab was open.
 *
 * A component, not a route loader: a loader runs only on navigation, and Log
 * out or a refused token ends the session without one. useDashboardSession
 * re-renders this on every change, so the redirect follows.
 */
const SignedInOnly: FC = () => {
  const dashboardSession = useDashboardSession();
  if (dashboardSession.status !== "signedIn") {
    return <Navigate replace to={paths.login} />;
  }

  return (
    <>
      {/* Back from a payment lands where finance was in the list, not at its
          top, and a new section opens at its top. */}
      <ScrollRestoration />
      <Outlet />
    </>
  );
};

export default SignedInOnly;

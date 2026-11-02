import type { FC } from "react";
import { Navigate, Outlet } from "react-router";
import { useAppSession } from "../../data/session";
import { paths } from "../paths";

/**
 * Wraps the screens for someone not yet signed in: Welcome and Login. A
 * signed-in payer goes to Home instead, both on a reopen with a saved login
 * and right after logging in.
 *
 * A component, not a route loader: a loader runs only on navigation, and a
 * login changes the session without one. useAppSession re-renders this on every
 * change, so the redirect follows.
 */
const SignedOutOnly: FC = () => {
  const appSession = useAppSession();
  if (appSession.status === "signedIn") {
    return <Navigate replace to={paths.home} />;
  }

  return <Outlet />;
};

export default SignedOutOnly;

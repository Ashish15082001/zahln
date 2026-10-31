import type { FC } from "react";
import { Navigate, Outlet } from "react-router";
import { useSession } from "../../data/session";
import { paths } from "../paths";

/**
 * Wraps the screens that need a signed-in cashier: Home. Anyone else goes to
 * Login, whether the saved login ran out or the session ended mid-shift.
 *
 * A component, not a route loader: a loader runs only on navigation, and Log
 * out or a refused token ends the session without one. useSession re-renders
 * this on every change, so the redirect follows.
 */
const SignedInOnly: FC = () => {
  const session = useSession();
  if (session.status !== "signedIn") {
    return <Navigate replace to={paths.login} />;
  }

  return <Outlet />;
};

export default SignedInOnly;

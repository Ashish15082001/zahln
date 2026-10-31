import type { FC } from "react";
import { Navigate, Outlet, ScrollRestoration } from "react-router";
import { useSession } from "../../data/session";
import { paths } from "../paths";

/**
 * Wraps the screens that need a signed-in payer: Home and a payment's detail.
 * Anyone else goes to
 * Login, whether the saved login ran out or the session ended while the app
 * was open.
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

  return (
    <>
      {/* Back from a payment lands where the payer was in the list, not at
          its top. Only the signed-in screens are long enough to scroll. */}
      <ScrollRestoration />
      <Outlet />
    </>
  );
};

export default SignedInOnly;

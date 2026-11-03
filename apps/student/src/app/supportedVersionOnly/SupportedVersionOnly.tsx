import type { FC } from "react";
import { Outlet } from "react-router";
import { useIsAppVersionSupported } from "../../data/appConfig";
import UpdateScreen from "../../screens/updateScreen/UpdateScreen";

/**
 * Wraps every screen, the signed-in ones and Login alike. Once the server's
 * minimum version is above this app's, the update screen takes the place of
 * whichever screen is open: an old version can't pay, and it may misread
 * what a newer server sends.
 *
 * Shown in place, not a redirect: the address stays, so if the config comes
 * back lower, the payer is where they were. The config is read again each
 * time the app comes back to the front, e.g. from the browser that
 * downloaded the update.
 */
const SupportedVersionOnly: FC = () => {
  const isAppVersionSupported = useIsAppVersionSupported();
  if (!isAppVersionSupported) return <UpdateScreen />;

  return <Outlet />;
};

export default SupportedVersionOnly;

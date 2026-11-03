import { useQuery } from "@tanstack/react-query";
import { getAppConfig } from "@zahln/api/appConfig";
import { isAppVersionSupported } from "@zahln/domain/appConfig/frontend";
import { config } from "../config";
import { http } from "./session";

const appConfigQueryKey = ["appConfig"] as const;

/**
 * The server's config: the minimum app version and whether payments are on.
 * Read when the app starts and each time it comes back to the front. Screens
 * never wait for it: until it comes, and while it can't be read, the app
 * works as before, and the server still refuses a payment from an old version
 * or while payments are paused.
 */
export const useAppConfig = () =>
  useQuery({
    queryKey: appConfigQueryKey,
    queryFn: ({ signal }) => getAppConfig(http, signal),
    // Not the payer's, unlike the rest of the cache: Log out keeps it, so the
    // update screen doesn't flicker away when someone logs out.
    meta: { isSharedByPayers: true },
  });

/**
 * Whether this version of the app may still be used. True until the config
 * says otherwise, and while it can't be read.
 */
export const useIsAppVersionSupported = (): boolean => {
  const appConfig = useAppConfig().data;
  return (
    appConfig === undefined ||
    isAppVersionSupported(config.appVersion, appConfig.minAppVersion)
  );
};

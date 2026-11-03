import { queryOptions, useQuery } from "@tanstack/react-query";
import { getAppConfig } from "@zahln/api/appConfig";
import {
  isAppVersionSupported,
  type AppConfig,
} from "@zahln/domain/appConfig/frontend";
import { config } from "../config";
import { queryClient } from "./queryClient";
import { http } from "./session";

const appConfigQueryKey = ["appConfig"] as const;

// While payments are paused, the Pay page asks this often, so Pay comes back
// by itself once they are on again.
const PAUSED_POLL_MS = 30_000;

// How long Pay waits for the config before going ahead without it. A slow
// server must not hold the payer at the button: the server still refuses a
// payment from an old version or while payments are paused.
const BEFORE_PAY_READ_LIMIT_MS = 3_000;

/** One config query, shared by the screens and the read before Pay. */
const appConfigQueryOptions = queryOptions({
  queryKey: appConfigQueryKey,
  queryFn: ({ signal }) => getAppConfig(http, signal),
  // Not the payer's, unlike the rest of the cache: Log out keeps it, so the
  // update screen doesn't flicker away when someone logs out.
  meta: { isSharedByPayers: true },
});

/** Settings for `useAppConfig`. */
export interface UseAppConfigOptions {
  /** Asks again every 30 seconds while payments are paused: the Pay page. */
  isPollingWhilePaused?: boolean;
}

/**
 * The server's config: the minimum app version and whether payments are on.
 * Read when the app starts and each time it comes back to the front. Screens
 * never wait for it: until it comes, and while it can't be read, the app
 * works as before, and the server still refuses a payment from an old version
 * or while payments are paused.
 */
export const useAppConfig = ({
  isPollingWhilePaused = false,
}: UseAppConfigOptions = {}) =>
  useQuery({
    ...appConfigQueryOptions,
    refetchInterval: (query) =>
      isPollingWhilePaused && query.state.data?.paymentsEnabled === false
        ? PAUSED_POLL_MS
        : false,
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

/** Why the config stops a new payment before it is asked for or sent. */
export type ConfigPayRefusal = "updateRequired" | "paymentsPaused";

/** What in `appConfig` stops a new payment, or null when nothing does. */
export const toConfigPayRefusal = (
  appConfig: AppConfig,
): ConfigPayRefusal | null => {
  if (!isAppVersionSupported(config.appVersion, appConfig.minAppVersion)) {
    return "updateRequired";
  }
  return appConfig.paymentsEnabled ? null : "paymentsPaused";
};

/**
 * The config, read afresh right before a new payment, or null when it
 * doesn't come within 3 seconds or can't be read: Pay then goes ahead, and
 * the server decides. The answer also goes into the cache, so the update
 * screen or the paused state shows at once.
 */
export const readAppConfigBeforePay = async (): Promise<AppConfig | null> => {
  let limitTimer: ReturnType<typeof setTimeout> | undefined;
  const limitReached = new Promise<null>((resolve) => {
    limitTimer = setTimeout(() => resolve(null), BEFORE_PAY_READ_LIMIT_MS);
  });
  try {
    // staleTime 0: always a new read, though one already on its way, e.g.
    // the page's own, is shared rather than sent twice.
    return await Promise.race([
      queryClient.fetchQuery({ ...appConfigQueryOptions, staleTime: 0 }),
      limitReached,
    ]);
  } catch {
    return null;
  } finally {
    clearTimeout(limitTimer);
  }
};

/**
 * Reads the config again, e.g. once a payment was refused for an old version
 * or paused payments, so the update screen or the paused state shows.
 */
export const refreshAppConfig = (): void => {
  void queryClient.invalidateQueries({ queryKey: appConfigQueryKey });
};

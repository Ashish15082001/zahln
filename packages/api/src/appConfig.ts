import { AppConfigResponseSchema } from "@zahln/domain/appConfig/backend";
import type { AppConfig } from "@zahln/domain/appConfig/frontend";
import type { Http } from "./http";

/**
 * GET /config: the minimum app version and whether payments are on. It needs
 * no login, so it is read before anyone has signed in, at start and again
 * before paying.
 */
export const getAppConfig = async (
  http: Http,
  signal?: AbortSignal,
): Promise<AppConfig> =>
  http.request({
    method: "GET",
    path: "/config",
    schema: AppConfigResponseSchema,
    authenticated: false,
    signal,
  });

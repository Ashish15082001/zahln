import { z } from "zod";

// ---- GET /config: what the server asks of every app, read with no login

export const AppConfigResponseSchema = z.object({
  // e.g. "1.0.0". Any string, not a version pattern: a malformed one must not
  // make the whole config unreadable and hide paymentsEnabled with it.
  // isAppVersionSupported decides what it means.
  minAppVersion: z.string(),
  // False: payments are paused, and POST .../payments answers 503.
  paymentsEnabled: z.boolean(),
});

export interface AppConfigResponse extends z.infer<
  typeof AppConfigResponseSchema
> {}

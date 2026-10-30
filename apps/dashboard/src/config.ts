import { parseApiEnv } from "@zahln/api/env";

export const config = {
  ...parseApiEnv(import.meta.env),
  appVersion: __APP_VERSION__,
};

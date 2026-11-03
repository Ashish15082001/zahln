import { parseApiEnv } from "@zahln/api/env";

export const config = {
  ...parseApiEnv(import.meta.env),
  appVersion: __APP_VERSION__,
  // Where a new version is published: the signed APKs are on the repo's
  // GitHub releases, since the app isn't on Google Play.
  appUpdateUrl: "https://github.com/Ashish15082001/zahln/releases/latest",
};

import { z } from "zod";
import { AppConfigResponseSchema } from "./backend";

// ---- shapes used in the app: the same as on the wire, since the server
// already sends camelCase keys. Screens import these, so they never depend on
// the wire shape directly.

export const AppConfigSchema = AppConfigResponseSchema;

export interface AppConfig extends z.infer<typeof AppConfigSchema> {}

// ---- the minimum app version

// Dot-separated whole numbers, e.g. "1.0.0" or "1.2". Anything else, such as
// "1.x" or "v1.0.0", is not a version the app can compare.
const VERSION_PATTERN = /^\d+(\.\d+)*$/;

/** "1.10.0" as [1, 10, 0], or null when it isn't a version. */
const toVersionParts = (version: string): number[] | null => {
  const trimmedVersion = version.trim();
  return VERSION_PATTERN.test(trimmedVersion)
    ? trimmedVersion.split(".").map(Number)
    : null;
};

/**
 * Whether `appVersion` is at least `minAppVersion`, comparing each number in
 * turn, so "1.10.0" is newer than "1.9.0". A missing part counts as 0: "1.2"
 * is "1.2.0".
 *
 * A version that can't be read counts as supported. A typo on the server must
 * not lock every payer out of the app, and the server still refuses a payment
 * from an old version with 426.
 */
export const isAppVersionSupported = (
  appVersion: string,
  minAppVersion: string,
): boolean => {
  const appVersionParts = toVersionParts(appVersion);
  const minAppVersionParts = toVersionParts(minAppVersion);
  if (appVersionParts === null || minAppVersionParts === null) return true;

  const partCount = Math.max(appVersionParts.length, minAppVersionParts.length);
  for (let partIndex = 0; partIndex < partCount; partIndex += 1) {
    const appPart = appVersionParts[partIndex] ?? 0;
    const minPart = minAppVersionParts[partIndex] ?? 0;
    if (appPart !== minPart) return appPart > minPart;
  }
  return true;
};

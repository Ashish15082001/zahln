import {
  BiometryType,
  NativeBiometric,
  type AvailableResult,
  type BiometricOptions,
  type IsAvailableOptions,
} from "@capgo/capacitor-native-biometric";
import { Capacitor } from "@capacitor/core";

/** What one check that the phone's owner is holding it gave. */
export type IdentityCheckResult =
  | { kind: "confirmed" }
  // Nothing to check with: a phone without a screen lock, or a browser.
  // Whoever holds such a phone can already open everything on it.
  | { kind: "unavailable" }
  // The payer closed the prompt. Not an error: nothing to show.
  | { kind: "cancelled" }
  // Too many tries: the finger or face was misread too often, or Android
  // blocks biometrics for a while. The PIN still works on the next try.
  | { kind: "lockedOut" }
  | { kind: "failed" };

/**
 * The calls the identity check needs from the plugin, typed as the plugin
 * types them, so tests can stand in for it.
 */
export interface IdentityCheckPlugin {
  isAvailable: (options?: IsAvailableOptions) => Promise<AvailableResult>;
  verifyIdentity: (options?: BiometricOptions) => Promise<void>;
}

/** Settings for `createIdentityCheck`. */
export interface IdentityCheckConfig {
  /** A browser has no screen lock to ask for. */
  isNative: boolean;
  identityCheckPlugin: IdentityCheckPlugin;
}

/** What the prompt says, in the payer's language. */
export interface ConfirmIdentityOptions {
  title: string;
  description: string;
}

// Every biometric the phone has, weak face unlock included: cheaper phones
// often have nothing stronger, and this only confirms the owner, it unlocks
// no stored secret. The device credential is the PIN, pattern or password,
// so a phone without biometrics still asks. On Android it is only offered
// when it is in this list: the plugin ignores `useFallback` there.
const ALLOWED_BIOMETRY_TYPES: BiometryType[] = [
  BiometryType.FINGERPRINT,
  BiometryType.FACE_AUTHENTICATION,
  BiometryType.IRIS_AUTHENTICATION,
  BiometryType.DEVICE_CREDENTIAL,
];

// The plugin's default is 1, so a single misread finger would end the check.
// 5 is the most Android allows.
const MAX_ATTEMPTS = 5;

// The plugin's codes for these, from its BiometricAuthError list. They come
// as strings on the rejected error.
const SYSTEM_CANCEL_CODE = "15";
const USER_CANCEL_CODE = "16";
const USER_LOCKOUT_CODE = "2";
const USER_TEMPORARY_LOCKOUT_CODE = "4";

const codeOf = (error: unknown): string | null =>
  typeof error === "object" && error !== null && "code" in error
    ? String(error.code)
    : null;

/**
 * Makes the check the app runs before paying. The app makes one, below;
 * tests pass a fake plugin.
 */
export const createIdentityCheck = (config: IdentityCheckConfig) => {
  const { isNative, identityCheckPlugin } = config;

  /**
   * Asks for a fingerprint, the face or the phone's PIN. Never rejects:
   * every failure comes back as a result.
   */
  const confirmIdentity = async ({
    title,
    description,
  }: ConfirmIdentityOptions): Promise<IdentityCheckResult> => {
    if (!isNative) return { kind: "unavailable" };

    try {
      // With the fallback counted, this is false only when the phone has
      // neither biometrics nor a screen lock: Android needs a screen lock
      // before it takes a fingerprint or a face.
      const { isAvailable } = await identityCheckPlugin.isAvailable({
        useFallback: true,
      });
      if (!isAvailable) return { kind: "unavailable" };
    } catch {
      return { kind: "failed" };
    }

    try {
      await identityCheckPlugin.verifyIdentity({
        title,
        description,
        allowedBiometryTypes: ALLOWED_BIOMETRY_TYPES,
        maxAttempts: MAX_ATTEMPTS,
      });
      return { kind: "confirmed" };
    } catch (error) {
      switch (codeOf(error)) {
        // Back, a tap outside, or the phone closing it, e.g. on a call.
        case USER_CANCEL_CODE:
        case SYSTEM_CANCEL_CODE:
          return { kind: "cancelled" };
        // Also what the plugin answers after MAX_ATTEMPTS misreads.
        case USER_LOCKOUT_CODE:
        case USER_TEMPORARY_LOCKOUT_CODE:
          return { kind: "lockedOut" };
      }
      return { kind: "failed" };
    }
  };

  return { confirmIdentity };
};

/** The check the apps use: the biometric plugin on this device. */
export const identityCheck = createIdentityCheck({
  isNative: Capacitor.isNativePlatform(),
  identityCheckPlugin: NativeBiometric,
});

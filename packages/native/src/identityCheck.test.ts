import {
  AuthenticationStrength,
  BiometryType,
  type BiometricOptions,
} from "@capgo/capacitor-native-biometric";
import { describe, expect, it } from "vitest";
import { createIdentityCheck, type IdentityCheckPlugin } from "./identityCheck";

const PROMPT_TEXT = {
  title: "Confirm payment",
  description: "€4.50 at Mensa Garching",
};

/** A rejection the way the plugin sends one, with its code as a string. */
const pluginError = (code: string | null): Error =>
  Object.assign(
    new Error("Authentication failed"),
    code === null ? {} : { code },
  );

interface FakePluginSetup {
  /** What the availability check says, or "throws". */
  available?: boolean | "throws";
  /** The error the prompt rejects with; it passes by default. */
  verifyError?: Error;
}

/** A stand-in for the plugin that records what was asked of it. */
const createFakePlugin = ({
  available = true,
  verifyError,
}: FakePluginSetup = {}) => {
  const calls: string[] = [];
  const promptOptions: (BiometricOptions | undefined)[] = [];

  const identityCheckPlugin: IdentityCheckPlugin = {
    isAvailable: (options) => {
      calls.push(`isAvailable useFallback=${String(options?.useFallback)}`);
      return available === "throws"
        ? Promise.reject(new Error("not implemented"))
        : Promise.resolve({
            isAvailable: available,
            authenticationStrength: available
              ? AuthenticationStrength.WEAK
              : AuthenticationStrength.NONE,
            biometryType: BiometryType.NONE,
            deviceIsSecure: available,
            strongBiometryIsAvailable: false,
          });
    },
    verifyIdentity: (options) => {
      calls.push("verifyIdentity");
      promptOptions.push(options);
      return verifyError === undefined
        ? Promise.resolve()
        : Promise.reject(verifyError);
    },
  };

  return { calls, identityCheckPlugin, promptOptions };
};

describe("confirmIdentity", () => {
  it("confirms once the prompt passes, offering every biometric and the PIN", async () => {
    const fake = createFakePlugin();
    const { confirmIdentity } = createIdentityCheck({
      isNative: true,
      identityCheckPlugin: fake.identityCheckPlugin,
    });

    expect(await confirmIdentity(PROMPT_TEXT)).toEqual({ kind: "confirmed" });
    expect(fake.calls).toEqual([
      "isAvailable useFallback=true",
      "verifyIdentity",
    ]);
    expect(fake.promptOptions).toEqual([
      {
        ...PROMPT_TEXT,
        allowedBiometryTypes: [
          BiometryType.FINGERPRINT,
          BiometryType.FACE_AUTHENTICATION,
          BiometryType.IRIS_AUTHENTICATION,
          BiometryType.DEVICE_CREDENTIAL,
        ],
        maxAttempts: 5,
      },
    ]);
  });

  it("is unavailable in a browser, without asking the plugin", async () => {
    const fake = createFakePlugin();
    const { confirmIdentity } = createIdentityCheck({
      isNative: false,
      identityCheckPlugin: fake.identityCheckPlugin,
    });

    expect(await confirmIdentity(PROMPT_TEXT)).toEqual({
      kind: "unavailable",
    });
    expect(fake.calls).toEqual([]);
  });

  it("is unavailable on a phone without a screen lock, with no prompt", async () => {
    const fake = createFakePlugin({ available: false });
    const { confirmIdentity } = createIdentityCheck({
      isNative: true,
      identityCheckPlugin: fake.identityCheckPlugin,
    });

    expect(await confirmIdentity(PROMPT_TEXT)).toEqual({
      kind: "unavailable",
    });
    expect(fake.calls).toEqual(["isAvailable useFallback=true"]);
  });

  it("is cancelled when the payer or the phone closes the prompt", async () => {
    for (const code of ["16", "15"]) {
      const { confirmIdentity } = createIdentityCheck({
        isNative: true,
        identityCheckPlugin: createFakePlugin({
          verifyError: pluginError(code),
        }).identityCheckPlugin,
      });

      expect(await confirmIdentity(PROMPT_TEXT)).toEqual({
        kind: "cancelled",
      });
    }
  });

  it("is locked out after too many tries", async () => {
    for (const code of ["4", "2"]) {
      const { confirmIdentity } = createIdentityCheck({
        isNative: true,
        identityCheckPlugin: createFakePlugin({
          verifyError: pluginError(code),
        }).identityCheckPlugin,
      });

      expect(await confirmIdentity(PROMPT_TEXT)).toEqual({
        kind: "lockedOut",
      });
    }
  });

  it("fails on any other error, and never counts it as confirmed", async () => {
    const setups: FakePluginSetup[] = [
      { verifyError: pluginError("0") },
      { verifyError: pluginError("1") },
      // The plugin's answer when Android lost the prompt's result.
      { verifyError: pluginError(null) },
      { available: "throws" },
    ];

    for (const setup of setups) {
      const { confirmIdentity } = createIdentityCheck({
        isNative: true,
        identityCheckPlugin: createFakePlugin(setup).identityCheckPlugin,
      });

      expect(await confirmIdentity(PROMPT_TEXT)).toEqual({ kind: "failed" });
    }
  });
});

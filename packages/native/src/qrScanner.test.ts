import {
  BarcodeFormat,
  BarcodeValueType,
  GoogleBarcodeScannerModuleInstallState,
  type GoogleBarcodeScannerModuleInstallProgressEvent,
  type ScanResult,
} from "@capacitor-mlkit/barcode-scanning";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createQrScanner, type GoogleCodeScanner } from "./qrScanner";

const QR_TEXT = "zahln://pay?order=ord_c0fa341c0c64bffc";

/** What the plugin gives back for one scanned QR code. */
const scannedQr = (rawValue: string): ScanResult => ({
  barcodes: [
    {
      displayValue: rawValue,
      format: BarcodeFormat.QrCode,
      rawValue,
      valueType: BarcodeValueType.Url,
    },
  ],
});

interface FakeScannerSetup {
  /** What the availability check says, or "throws" without Play services. */
  available: boolean | "throws";
  /** The install's progress events, sent after it has started. */
  installStates?: GoogleBarcodeScannerModuleInstallState[];
  /** Makes starting the install fail with this message. */
  installErrorMessage?: string;
  /** What a scan resolves with, or the error it rejects with. */
  scanOutcome?: ScanResult | Error;
}

/** A stand-in for the plugin that records what was asked of it. */
const createFakeScanner = ({
  available,
  installStates = [],
  installErrorMessage,
  scanOutcome = scannedQr(QR_TEXT),
}: FakeScannerSetup) => {
  const calls: string[] = [];
  const progressListeners = new Set<
    (event: GoogleBarcodeScannerModuleInstallProgressEvent) => void
  >();

  const googleCodeScanner: GoogleCodeScanner = {
    isGoogleBarcodeScannerModuleAvailable: () => {
      calls.push("isAvailable");
      return available === "throws"
        ? Promise.reject(new Error("Google Play services is missing."))
        : Promise.resolve({ available });
    },
    installGoogleBarcodeScannerModule: () => {
      calls.push("install");
      if (installErrorMessage !== undefined) {
        return Promise.reject(new Error(installErrorMessage));
      }
      // Like the plugin: the start resolves first, the states come after.
      setTimeout(() => {
        for (const state of installStates) {
          for (const listener of progressListeners) listener({ state });
        }
      }, 0);
      return Promise.resolve();
    },
    addListener: (_eventName, listener) => {
      progressListeners.add(listener);
      return Promise.resolve({
        remove: () => {
          progressListeners.delete(listener);
          return Promise.resolve();
        },
      });
    },
    scan: (options) => {
      calls.push(`scan ${options?.formats?.join(",") ?? "any"}`);
      return scanOutcome instanceof Error
        ? Promise.reject(scanOutcome)
        : Promise.resolve(scanOutcome);
    },
  };

  return {
    calls,
    googleCodeScanner,
    listenerCount: () => progressListeners.size,
  };
};

afterEach(() => {
  vi.useRealTimers();
});

describe("scanQrCode", () => {
  it("scans for QR codes only and gives back the text", async () => {
    const fake = createFakeScanner({ available: true });
    const { scanQrCode } = createQrScanner({
      isAndroid: true,
      googleCodeScanner: fake.googleCodeScanner,
    });

    expect(await scanQrCode()).toEqual({ kind: "scanned", text: QR_TEXT });
    expect(fake.calls).toEqual(["isAvailable", "scan QR_CODE"]);
  });

  it("is unavailable off Android, without asking the plugin", async () => {
    const fake = createFakeScanner({ available: true });
    const { scanQrCode } = createQrScanner({
      isAndroid: false,
      googleCodeScanner: fake.googleCodeScanner,
    });

    expect(await scanQrCode()).toEqual({ kind: "unavailable" });
    expect(fake.calls).toEqual([]);
  });

  it("is unavailable without Google Play services", async () => {
    const fake = createFakeScanner({ available: "throws" });
    const { scanQrCode } = createQrScanner({
      isAndroid: true,
      googleCodeScanner: fake.googleCodeScanner,
    });

    expect(await scanQrCode()).toEqual({ kind: "unavailable" });
    expect(fake.calls).toEqual(["isAvailable"]);
  });

  it("installs the scanner first, says so, then scans", async () => {
    const fake = createFakeScanner({
      available: false,
      installStates: [
        GoogleBarcodeScannerModuleInstallState.PENDING,
        GoogleBarcodeScannerModuleInstallState.DOWNLOADING,
        GoogleBarcodeScannerModuleInstallState.COMPLETED,
      ],
    });
    const { scanQrCode } = createQrScanner({
      isAndroid: true,
      googleCodeScanner: fake.googleCodeScanner,
    });
    const handleInstallStart = vi.fn();

    const result = await scanQrCode({ handleInstallStart });

    expect(result).toEqual({ kind: "scanned", text: QR_TEXT });
    expect(handleInstallStart).toHaveBeenCalledOnce();
    expect(fake.calls).toEqual(["isAvailable", "install", "scan QR_CODE"]);
    expect(fake.listenerCount()).toBe(0);
  });

  it("is unavailable when the install fails, and never opens the scanner", async () => {
    const fake = createFakeScanner({
      available: false,
      installStates: [
        GoogleBarcodeScannerModuleInstallState.DOWNLOADING,
        GoogleBarcodeScannerModuleInstallState.FAILED,
      ],
    });
    const { scanQrCode } = createQrScanner({
      isAndroid: true,
      googleCodeScanner: fake.googleCodeScanner,
    });

    expect(await scanQrCode()).toEqual({ kind: "unavailable" });
    expect(fake.calls).toEqual(["isAvailable", "install"]);
    expect(fake.listenerCount()).toBe(0);
  });

  it("gives up on an install that never finishes", async () => {
    vi.useFakeTimers();
    const fake = createFakeScanner({
      available: false,
      installStates: [GoogleBarcodeScannerModuleInstallState.DOWNLOAD_PAUSED],
    });
    const { scanQrCode } = createQrScanner({
      isAndroid: true,
      googleCodeScanner: fake.googleCodeScanner,
      installTimeoutMs: 60_000,
    });

    const result = scanQrCode();
    await vi.advanceTimersByTimeAsync(60_000);

    expect(await result).toEqual({ kind: "unavailable" });
    expect(fake.listenerCount()).toBe(0);
  });

  it("is unavailable, not a rejection, when the install can't even start listening", async () => {
    const fake = createFakeScanner({ available: false });
    fake.googleCodeScanner.addListener = () =>
      Promise.reject(new Error("Plugin is not implemented on android"));
    const { scanQrCode } = createQrScanner({
      isAndroid: true,
      googleCodeScanner: fake.googleCodeScanner,
    });

    expect(await scanQrCode()).toEqual({ kind: "unavailable" });
  });

  it("scans when the scanner got installed between the check and the install", async () => {
    const fake = createFakeScanner({
      available: false,
      installErrorMessage:
        "The Google Barcode Scanner Module is already installed.",
    });
    const { scanQrCode } = createQrScanner({
      isAndroid: true,
      googleCodeScanner: fake.googleCodeScanner,
    });

    expect(await scanQrCode()).toEqual({ kind: "scanned", text: QR_TEXT });
  });

  it("reports a closed scanner as cancelled, not as a failure", async () => {
    const fake = createFakeScanner({
      available: true,
      scanOutcome: new Error("scan canceled."),
    });
    const { scanQrCode } = createQrScanner({
      isAndroid: true,
      googleCodeScanner: fake.googleCodeScanner,
    });

    expect(await scanQrCode()).toEqual({ kind: "cancelled" });
  });

  it("is unavailable when the scanner itself fails, so the next way is tried", async () => {
    const fake = createFakeScanner({
      available: true,
      scanOutcome: new Error("The scan failed."),
    });
    const { scanQrCode } = createQrScanner({
      isAndroid: true,
      googleCodeScanner: fake.googleCodeScanner,
    });

    expect(await scanQrCode()).toEqual({ kind: "unavailable" });
  });
});

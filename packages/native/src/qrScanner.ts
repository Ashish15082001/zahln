import {
  BarcodeFormat,
  BarcodeScanner,
  GoogleBarcodeScannerModuleInstallState,
  type GoogleBarcodeScannerModuleInstallProgressEvent,
  type ScanOptions,
  type ScanResult,
} from "@capacitor-mlkit/barcode-scanning";
import { Capacitor, type PluginListenerHandle } from "@capacitor/core";

/** What one try at scanning gave. */
export type QrScanResult =
  | { kind: "scanned"; text: string }
  // The payer closed the scanner. Not an error: nothing to show.
  | { kind: "cancelled" }
  // This way of scanning can't run here: not Android, no Google Play
  // services, or its scanner couldn't be installed. The app tries its next
  // way to scan.
  | { kind: "unavailable" };

/**
 * The calls the Google code scanner needs from the plugin, typed as the
 * plugin types them, so tests can stand in for it.
 */
export interface GoogleCodeScanner {
  isGoogleBarcodeScannerModuleAvailable: () => Promise<{ available: boolean }>;
  installGoogleBarcodeScannerModule: () => Promise<void>;
  addListener: (
    eventName: "googleBarcodeScannerModuleInstallProgress",
    listenerFunc: (
      event: GoogleBarcodeScannerModuleInstallProgressEvent,
    ) => void,
  ) => Promise<PluginListenerHandle>;
  scan: (options?: ScanOptions) => Promise<ScanResult>;
}

/** Settings for `createQrScanner`. The optional ones have defaults. */
export interface QrScannerConfig {
  /** The Google code scanner runs on Android only. */
  isAndroid: boolean;
  googleCodeScanner: GoogleCodeScanner;
  /** How long to wait for the scanner to install before giving up on it. */
  installTimeoutMs?: number;
}

/** Options for one scan. */
export interface ScanQrCodeOptions {
  /**
   * Called when the scanner has to be installed first, which takes a few
   * seconds, so the screen can say why nothing has opened yet.
   */
  handleInstallStart?: () => void;
}

// The plugin's messages for these, from its Android code. A cancel is the
// payer's choice; a lost result means Android ended the app mid-scan, and
// the payer can just scan again.
const SCAN_CANCELED_MESSAGE = "scan canceled.";
const SCAN_RESULT_LOST_MESSAGE =
  "The scan result was lost because the app process was terminated.";
const MODULE_ALREADY_INSTALLED_MESSAGE =
  "The Google Barcode Scanner Module is already installed.";

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

/**
 * Makes the scanner the app uses. The app makes one, below; tests pass a
 * fake plugin. Defaults: 60 s to install the scanner.
 */
export const createQrScanner = (config: QrScannerConfig) => {
  const { isAndroid, googleCodeScanner, installTimeoutMs = 60_000 } = config;

  /**
   * Installs Google's scanner and waits for the result. Resolves true once
   * it's installed, false if it failed, was cancelled or took too long.
   */
  const installScanner = async (): Promise<boolean> => {
    let handleInstallFinished: (isInstalled: boolean) => void = () => undefined;
    const installFinished = new Promise<boolean>((resolve) => {
      handleInstallFinished = resolve;
    });
    // Listening before asking, so a quick install can't finish unheard.
    const progressListener = await googleCodeScanner.addListener(
      "googleBarcodeScannerModuleInstallProgress",
      (event) => {
        if (event.state === GoogleBarcodeScannerModuleInstallState.COMPLETED) {
          handleInstallFinished(true);
        } else if (
          event.state === GoogleBarcodeScannerModuleInstallState.FAILED ||
          event.state === GoogleBarcodeScannerModuleInstallState.CANCELED
        ) {
          handleInstallFinished(false);
        }
      },
    );
    const timer = setTimeout(
      () => handleInstallFinished(false),
      installTimeoutMs,
    );

    try {
      // Resolves once the install has started; the end comes as an event.
      await googleCodeScanner.installGoogleBarcodeScannerModule();
    } catch (error) {
      // Installed in the moment since the check: there is nothing to wait
      // for. Any other failure means it won't install.
      handleInstallFinished(
        messageOf(error) === MODULE_ALREADY_INSTALLED_MESSAGE,
      );
    }

    try {
      return await installFinished;
    } finally {
      clearTimeout(timer);
      await progressListener.remove();
    }
  };

  /**
   * Opens Google's code scanner, which needs no camera permission, and gives
   * back the QR code's text. On a phone without its scanner yet, installs it
   * first. Never rejects: every failure comes back as `unavailable`.
   */
  const scanQrCode = async (
    options: ScanQrCodeOptions = {},
  ): Promise<QrScanResult> => {
    if (!isAndroid) return { kind: "unavailable" };

    let isScannerInstalled: boolean;
    try {
      const { available } =
        await googleCodeScanner.isGoogleBarcodeScannerModuleAvailable();
      isScannerInstalled = available;
    } catch {
      // Throws without Google Play services, e.g. on Huawei phones.
      return { kind: "unavailable" };
    }

    if (!isScannerInstalled) {
      options.handleInstallStart?.();
      // A plugin call failing inside the install, e.g. adding the listener,
      // means it won't install either.
      const isInstalled = await installScanner().catch(() => false);
      if (!isInstalled) return { kind: "unavailable" };
    }

    try {
      const { barcodes } = await googleCodeScanner.scan({
        formats: [BarcodeFormat.QrCode],
      });
      // Always one barcode on success. An empty text still goes back, so the
      // app says it isn't an order rather than nothing at all.
      return { kind: "scanned", text: barcodes[0]?.rawValue ?? "" };
    } catch (error) {
      const message = messageOf(error);
      if (
        message === SCAN_CANCELED_MESSAGE ||
        message === SCAN_RESULT_LOST_MESSAGE
      ) {
        return { kind: "cancelled" };
      }
      return { kind: "unavailable" };
    }
  };

  return { scanQrCode };
};

/** The scanner the apps use: the ML Kit plugin on this device. */
export const qrScanner = createQrScanner({
  isAndroid: Capacitor.getPlatform() === "android",
  googleCodeScanner: BarcodeScanner,
});

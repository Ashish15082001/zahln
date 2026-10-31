import {
  BarcodeFormat,
  BarcodeScanner,
  LensFacing,
  type BarcodesScannedEvent,
  type CameraPermissionState,
  type StartScanOptions,
} from "@capacitor-mlkit/barcode-scanning";
import { Capacitor, type PluginListenerHandle } from "@capacitor/core";

/** Whether the app may use the camera. */
export type CameraAccess = "granted" | "denied";

/** A running camera scan. */
export interface CameraScanning {
  /** Stops the camera. Safe to call more than once. */
  stopScanning: () => Promise<void>;
}

/**
 * The calls the app's own camera scanner needs from the plugin, typed as the
 * plugin types them, so tests can stand in for it.
 */
export interface CameraBarcodeScanner {
  isSupported: () => Promise<{ supported: boolean }>;
  checkPermissions: () => Promise<{ camera: CameraPermissionState }>;
  requestPermissions: () => Promise<{ camera: CameraPermissionState }>;
  openSettings: () => Promise<void>;
  addListener: (
    eventName: "barcodesScanned",
    listenerFunc: (event: BarcodesScannedEvent) => void,
  ) => Promise<PluginListenerHandle>;
  startScan: (options?: StartScanOptions) => Promise<void>;
  stopScan: () => Promise<void>;
}

/** Settings for `createCameraScanner`. */
export interface CameraScannerConfig {
  /** On a phone the camera shows behind the page; in a browser, in a video. */
  isNative: boolean;
  cameraBarcodeScanner: CameraBarcodeScanner;
}

/** Options for `startScanning`. */
export interface StartScanningOptions {
  /** Called with the text of every QR code the camera sees, until stopped. */
  handleQrText: (qrText: string) => void;
  /** Where a browser plays the camera. A phone ignores it. */
  videoElement?: HTMLVideoElement;
}

// "limited" is iOS letting the app use the camera with restrictions: still a
// yes for scanning.
const isGranted = (state: CameraPermissionState): boolean =>
  state === "granted" || state === "limited";

/**
 * Makes the camera scanner the app falls back to when Google's can't run. It
 * needs the camera permission. The app makes one, below; tests pass a fake
 * plugin.
 */
export const createCameraScanner = (config: CameraScannerConfig) => {
  const { isNative, cameraBarcodeScanner } = config;

  /**
   * Whether a camera scan can run here: a phone with a camera, or a browser
   * with BarcodeDetector (Chrome on Android and macOS, not on Windows).
   */
  const isAvailable = async (): Promise<boolean> => {
    try {
      const { supported } = await cameraBarcodeScanner.isSupported();
      return supported;
    } catch {
      return false;
    }
  };

  /**
   * Asks for the camera unless it's already allowed. After "Don't allow"
   * twice, Android no longer asks and answers denied straight away.
   */
  const requestCameraAccess = async (): Promise<CameraAccess> => {
    try {
      const { camera } = await cameraBarcodeScanner.checkPermissions();
      if (isGranted(camera)) return "granted";

      const requested = await cameraBarcodeScanner.requestPermissions();
      return isGranted(requested.camera) ? "granted" : "denied";
    } catch {
      return "denied";
    }
  };

  /** Opens the app's page in Android's Settings, where the camera is allowed. */
  const openSettings = async (): Promise<void> => {
    if (!isNative) return;
    // Nothing to tell the payer if it doesn't open: the button just does
    // nothing, and the typed code is still there.
    await cameraBarcodeScanner.openSettings().catch(() => undefined);
  };

  /**
   * Starts the camera and reports each QR code it sees. Null when the camera
   * couldn't start, e.g. another app holds it. On a phone the page must be
   * see-through while it runs, since the camera shows behind it.
   */
  const startScanning = async ({
    handleQrText,
    videoElement,
  }: StartScanningOptions): Promise<CameraScanning | null> => {
    let qrListener: PluginListenerHandle;
    try {
      // Listening before starting, so the first code seen isn't missed.
      qrListener = await cameraBarcodeScanner.addListener(
        "barcodesScanned",
        (event) => {
          for (const barcode of event.barcodes) {
            if (barcode.rawValue) handleQrText(barcode.rawValue);
          }
        },
      );
    } catch {
      return null;
    }

    try {
      await cameraBarcodeScanner.startScan({
        formats: [BarcodeFormat.QrCode],
        lensFacing: LensFacing.Back,
        videoElement,
      });
    } catch {
      await qrListener.remove().catch(() => undefined);
      return null;
    }

    let isStopped = false;
    return {
      stopScanning: async () => {
        if (isStopped) return;
        isStopped = true;
        await qrListener.remove().catch(() => undefined);
        await cameraBarcodeScanner.stopScan().catch(() => undefined);
      },
    };
  };

  return {
    isAvailable,
    isNative,
    openSettings,
    requestCameraAccess,
    startScanning,
  };
};

/** The camera scanner the apps use: the ML Kit plugin on this device. */
export const cameraScanner = createCameraScanner({
  isNative: Capacitor.isNativePlatform(),
  cameraBarcodeScanner: BarcodeScanner,
});

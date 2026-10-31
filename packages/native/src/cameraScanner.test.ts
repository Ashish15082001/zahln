import {
  BarcodeFormat,
  BarcodeValueType,
  type BarcodesScannedEvent,
  type CameraPermissionState,
} from "@capacitor-mlkit/barcode-scanning";
import { describe, expect, it, vi } from "vitest";
import {
  createCameraScanner,
  type CameraBarcodeScanner,
} from "./cameraScanner";

interface FakeCameraSetup {
  supported?: boolean | "throws";
  permission?: CameraPermissionState;
  /** What a request answers; the permission is unchanged by default. */
  requestedPermission?: CameraPermissionState;
  startFails?: boolean;
}

/** A stand-in for the plugin that records what was asked of it. */
const createFakeCamera = ({
  supported = true,
  permission = "granted",
  requestedPermission = permission,
  startFails = false,
}: FakeCameraSetup = {}) => {
  const calls: string[] = [];
  const qrListeners = new Set<(event: BarcodesScannedEvent) => void>();

  const cameraBarcodeScanner: CameraBarcodeScanner = {
    isSupported: () =>
      supported === "throws"
        ? Promise.reject(new Error("not implemented"))
        : Promise.resolve({ supported }),
    checkPermissions: () => {
      calls.push("checkPermissions");
      return Promise.resolve({ camera: permission });
    },
    requestPermissions: () => {
      calls.push("requestPermissions");
      return Promise.resolve({ camera: requestedPermission });
    },
    openSettings: () => {
      calls.push("openSettings");
      return Promise.resolve();
    },
    addListener: (_eventName, listener) => {
      calls.push("addListener");
      qrListeners.add(listener);
      return Promise.resolve({
        remove: () => {
          calls.push("removeListener");
          qrListeners.delete(listener);
          return Promise.resolve();
        },
      });
    },
    startScan: (options) => {
      calls.push(`startScan ${options?.formats?.join(",") ?? "any"}`);
      return startFails
        ? Promise.reject(new Error("Camera is in use"))
        : Promise.resolve();
    },
    stopScan: () => {
      calls.push("stopScan");
      return Promise.resolve();
    },
  };

  /** Plays the plugin seeing these texts in one camera frame. */
  const seeQrTexts = (...rawValues: (string | undefined)[]): void => {
    const event: BarcodesScannedEvent = {
      barcodes: rawValues.map((rawValue) => ({
        displayValue: rawValue ?? "",
        format: BarcodeFormat.QrCode,
        rawValue,
        valueType: BarcodeValueType.Text,
      })),
    };
    for (const listener of qrListeners) listener(event);
  };

  return { calls, cameraBarcodeScanner, seeQrTexts };
};

describe("isAvailable", () => {
  it("is what the plugin says, and false when it can't say", async () => {
    const available = createCameraScanner({
      isNative: true,
      cameraBarcodeScanner: createFakeCamera().cameraBarcodeScanner,
    });
    const throwing = createCameraScanner({
      isNative: false,
      cameraBarcodeScanner: createFakeCamera({ supported: "throws" })
        .cameraBarcodeScanner,
    });

    expect(await available.isAvailable()).toBe(true);
    expect(await throwing.isAvailable()).toBe(false);
  });
});

describe("requestCameraAccess", () => {
  it("doesn't ask again when the camera is already allowed", async () => {
    const fake = createFakeCamera({ permission: "granted" });
    const scanner = createCameraScanner({
      isNative: true,
      cameraBarcodeScanner: fake.cameraBarcodeScanner,
    });

    expect(await scanner.requestCameraAccess()).toBe("granted");
    expect(fake.calls).toEqual(["checkPermissions"]);
  });

  it("asks, and passes on the payer's answer", async () => {
    const allowing = createFakeCamera({
      permission: "prompt",
      requestedPermission: "granted",
    });
    const refusing = createFakeCamera({
      permission: "prompt-with-rationale",
      requestedPermission: "denied",
    });

    expect(
      await createCameraScanner({
        isNative: true,
        cameraBarcodeScanner: allowing.cameraBarcodeScanner,
      }).requestCameraAccess(),
    ).toBe("granted");
    expect(
      await createCameraScanner({
        isNative: true,
        cameraBarcodeScanner: refusing.cameraBarcodeScanner,
      }).requestCameraAccess(),
    ).toBe("denied");
    expect(allowing.calls).toEqual(["checkPermissions", "requestPermissions"]);
  });
});

describe("openSettings", () => {
  it("opens Android's settings on a phone, and does nothing in a browser", async () => {
    const phone = createFakeCamera();
    const browser = createFakeCamera();

    await createCameraScanner({
      isNative: true,
      cameraBarcodeScanner: phone.cameraBarcodeScanner,
    }).openSettings();
    await createCameraScanner({
      isNative: false,
      cameraBarcodeScanner: browser.cameraBarcodeScanner,
    }).openSettings();

    expect(phone.calls).toEqual(["openSettings"]);
    expect(browser.calls).toEqual([]);
  });
});

describe("startScanning", () => {
  it("listens first, scans for QR codes only, and reports each text", async () => {
    const fake = createFakeCamera();
    const scanner = createCameraScanner({
      isNative: true,
      cameraBarcodeScanner: fake.cameraBarcodeScanner,
    });
    const handleQrText = vi.fn();

    const cameraScanning = await scanner.startScanning({ handleQrText });
    fake.seeQrTexts("zahln://pay?order=ord_1", undefined, "WIFI:S:Mensa;;");

    expect(cameraScanning).not.toBeNull();
    expect(fake.calls).toEqual(["addListener", "startScan QR_CODE"]);
    expect(handleQrText.mock.calls).toEqual([
      ["zahln://pay?order=ord_1"],
      ["WIFI:S:Mensa;;"],
    ]);
  });

  it("stops the camera and stops listening, once however often it's called", async () => {
    const fake = createFakeCamera();
    const scanner = createCameraScanner({
      isNative: true,
      cameraBarcodeScanner: fake.cameraBarcodeScanner,
    });
    const handleQrText = vi.fn();
    const cameraScanning = await scanner.startScanning({ handleQrText });

    await cameraScanning?.stopScanning();
    await cameraScanning?.stopScanning();
    fake.seeQrTexts("zahln://pay?order=ord_1");

    expect(fake.calls.slice(2)).toEqual(["removeListener", "stopScan"]);
    expect(handleQrText).not.toHaveBeenCalled();
  });

  it("is null when the camera won't start, and leaves no listener behind", async () => {
    const fake = createFakeCamera({ startFails: true });
    const scanner = createCameraScanner({
      isNative: true,
      cameraBarcodeScanner: fake.cameraBarcodeScanner,
    });

    expect(await scanner.startScanning({ handleQrText: vi.fn() })).toBeNull();
    expect(fake.calls).toEqual([
      "addListener",
      "startScan QR_CODE",
      "removeListener",
    ]);
  });
});

import {
  toOrderIdFromQr,
  toOrderIdFromTypedCode,
} from "@zahln/domain/order/frontend";
import {
  cameraScanner,
  type CameraAccess,
  type CameraScanning,
} from "@zahln/native/cameraScanner";
import { qrScanner, type ScanQrCodeOptions } from "@zahln/native/qrScanner";

/** What scanning for an order gave. */
export type OrderScanResult =
  | { kind: "order"; orderId: string }
  // A QR code was read, but it isn't a Zahln order: another app's, a web
  // link, or a damaged one.
  | { kind: "notAnOrder" }
  // The payer closed the scanner.
  | { kind: "cancelled" }
  // Google's scanner can't run on this device. The app's own camera scanner
  // is next.
  | { kind: "unavailable" };

/**
 * Opens Google's scanner and reads the order from the till's QR code. Screens
 * call this, never the scanner itself, so the scan and the check of what it
 * read can't be split apart.
 */
export const scanOrderQr = async (
  options?: ScanQrCodeOptions,
): Promise<OrderScanResult> => {
  const scanResult = await qrScanner.scanQrCode(options);
  if (scanResult.kind !== "scanned") return scanResult;

  const orderId = toOrderIdFromQr(scanResult.text);
  return orderId === null ? { kind: "notAnOrder" } : { kind: "order", orderId };
};

export type { CameraAccess, CameraScanning };

/** Options for `startOrderCameraScan`. */
export interface OrderCameraScanOptions {
  /** Called for each Zahln order the camera sees, until stopped. */
  handleOrderId: (orderId: string) => void;
  /** Called for each QR code the camera sees that isn't a Zahln order. */
  handleNotAnOrder: () => void;
  /** Where a browser plays the camera. A phone ignores it. */
  videoElement?: HTMLVideoElement;
}

/**
 * The app's own camera scanner, for when Google's can't run. Like
 * scanOrderQr, it hands screens orders, not raw QR text.
 */
export const orderCameraScan = {
  /** On a phone the camera shows behind the page, which must let it through. */
  isBehindPage: cameraScanner.isNative,
  isAvailable: cameraScanner.isAvailable,
  openSettings: cameraScanner.openSettings,
  requestCameraAccess: cameraScanner.requestCameraAccess,
  start: ({
    handleNotAnOrder,
    handleOrderId,
    videoElement,
  }: OrderCameraScanOptions): Promise<CameraScanning | null> =>
    cameraScanner.startScanning({
      handleQrText: (qrText) => {
        const orderId = toOrderIdFromQr(qrText);
        if (orderId === null) handleNotAnOrder();
        else handleOrderId(orderId);
      },
      videoElement,
    }),
};

/** The order id from a typed code, or null. The last resort after scanning. */
export const readTypedOrderCode = toOrderIdFromTypedCode;

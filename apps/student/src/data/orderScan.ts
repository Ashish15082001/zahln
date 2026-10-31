import { toOrderIdFromQr } from "@zahln/domain/order/frontend";
import { qrScanner, type ScanQrCodeOptions } from "@zahln/native/qrScanner";

/** What scanning for an order gave. */
export type OrderScanResult =
  | { kind: "order"; orderId: string }
  // A QR code was read, but it isn't a Zahln order: another app's, a web
  // link, or a damaged one.
  | { kind: "notAnOrder" }
  // The payer closed the scanner.
  | { kind: "cancelled" }
  // The scanner can't run on this device.
  | { kind: "unavailable" };

/**
 * Opens the scanner and reads the order from the till's QR code. Screens call
 * this, never the scanner itself, so the scan and the check of what it read
 * can't be split apart.
 */
export const scanOrderQr = async (
  options?: ScanQrCodeOptions,
): Promise<OrderScanResult> => {
  const scanResult = await qrScanner.scanQrCode(options);
  if (scanResult.kind !== "scanned") return scanResult;

  const orderId = toOrderIdFromQr(scanResult.text);
  return orderId === null ? { kind: "notAnOrder" } : { kind: "order", orderId };
};

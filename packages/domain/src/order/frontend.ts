import { z } from "zod";
import { OrderStatusResponseSchema, type OrderResponse } from "./backend";

// ---- enums: the same values in the app as on the wire

export const OrderStatusSchema = OrderStatusResponseSchema;
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

// ---- shapes used in the app

/**
 * An order as the till follows it. Only what the till shows or decides on:
 * the cashier rang up the items, so they aren't repeated here.
 */
export const OrderSchema = z.object({
  id: z.string().min(1),
  status: OrderStatusSchema,
  qrPayload: z.string().min(1),
  // A number, like the session's expiry, so it compares with server time
  // without parsing a date each time.
  expiresAtMs: z.int(),
  version: z.int().min(0),
  paymentId: z.string().min(1).nullable(),
});

export interface Order extends z.infer<typeof OrderSchema> {}

// ---- from the wire shape

export const toOrder = (response: OrderResponse): Order => ({
  id: response.id,
  status: response.status,
  qrPayload: response.qrPayload,
  // The schema has already checked this is an ISO date-time, so it parses.
  expiresAtMs: Date.parse(response.expiresAt),
  version: response.version,
  paymentId: response.paymentId ?? null,
});

/**
 * Of two copies of one order, the later. The server can answer a read with an
 * earlier state, so a lower version never replaces a higher one: an old `open`
 * must not undo `paid`.
 */
export const newerOrder = (current: Order | undefined, next: Order): Order =>
  current && current.version > next.version ? current : next;

// ---- the till's QR code

// What the till's QR code holds, e.g. `zahln://pay?order=ord_c0fa341c0c64bffc`,
// as the dev server sends it in `qrPayload`.
const QR_PAYLOAD_PREFIX = "zahln://pay?";

const ORDER_PARAMETER = "order=";

// Letters, digits, `_` and `-`, as the server's ids are. Anything else can't
// be an order, and is refused before it reaches a URL.
const ORDER_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

/**
 * The order id in a scanned QR code, or null when the code isn't a Zahln
 * order: another app's QR, a web link, or a damaged one.
 *
 * Split by hand, not with URLSearchParams: domain has no DOM, and an id never
 * needs decoding, since an encoded one fails ORDER_ID_PATTERN anyway.
 */
export const toOrderIdFromQr = (qrText: string): string | null => {
  const trimmedText = qrText.trim();
  if (!trimmedText.startsWith(QR_PAYLOAD_PREFIX)) return null;

  const orderId = trimmedText
    .slice(QR_PAYLOAD_PREFIX.length)
    .split("&")
    .find((parameter) => parameter.startsWith(ORDER_PARAMETER))
    ?.slice(ORDER_PARAMETER.length);
  return orderId !== undefined && ORDER_ID_PATTERN.test(orderId)
    ? orderId
    : null;
};

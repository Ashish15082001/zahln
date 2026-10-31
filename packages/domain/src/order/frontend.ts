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

import { z } from "zod";
import {
  PaymentItemResponseSchema,
  PaymentStatusResponseSchema,
  type PaymentPageResponse,
  type PaymentResponse,
} from "./backend";

// ---- enums: the same values in the app as on the wire

export const PaymentStatusSchema = PaymentStatusResponseSchema;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

// ---- shapes used in the app

// The same as on the wire: camelCase, whole cents, and the name in both
// languages so the screen picks one.
export const PaymentItemSchema = PaymentItemResponseSchema;

export interface PaymentItem extends z.infer<typeof PaymentItemSchema> {}

/**
 * A payment as the student app's history shows it. Only what a payer sees:
 * the till, the payer and the attention flags are for the cashier and finance.
 */
export const PaymentSchema = z.object({
  id: z.string().min(1),
  orderId: z.string().min(1),
  status: PaymentStatusSchema,
  amountCents: z.int().min(0),
  mensaName: z.string(),
  items: z.array(PaymentItemSchema),
  refundedAmountCents: z.int().min(0),
  pendingRefundAmountCents: z.int().min(0),
  // A number, like the order's expiry, so sorting and formatting don't parse
  // a date each time.
  createdAtMs: z.int(),
  version: z.int().min(0),
});

export interface Payment extends z.infer<typeof PaymentSchema> {}

/** One page of payments, newest first, and where the next one starts. */
export const PaymentPageSchema = z.object({
  payments: z.array(PaymentSchema),
  /** Null on the last page. */
  nextCursor: z.string().min(1).nullable(),
});

export interface PaymentPage extends z.infer<typeof PaymentPageSchema> {}

// ---- from the wire shape

export const toPayment = (response: PaymentResponse): Payment => ({
  id: response.id,
  orderId: response.orderId,
  status: response.status,
  amountCents: response.amountCents,
  mensaName: response.mensa.name,
  items: response.items,
  refundedAmountCents: response.refundedAmountCents,
  pendingRefundAmountCents: response.pendingRefundAmountCents,
  // The schema has already checked this is an ISO date-time, so it parses.
  createdAtMs: Date.parse(response.createdAt),
  version: response.version,
});

export const toPaymentPage = (response: PaymentPageResponse): PaymentPage => ({
  payments: response.items.map(toPayment),
  nextCursor: response.nextCursor,
});

/**
 * Of two copies of one payment, the later. The server can answer a read with
 * an earlier state, so a lower version never replaces a higher one: an old
 * `pending` must not undo `confirmed`.
 */
export const newerPayment = (
  cachedPayment: Payment | undefined,
  receivedPayment: Payment,
): Payment =>
  cachedPayment && cachedPayment.version > receivedPayment.version
    ? cachedPayment
    : receivedPayment;

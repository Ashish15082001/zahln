import { z } from "zod";
import {
  PaymentItemResponseSchema,
  PaymentStatusResponseSchema,
  RefundStatusResponseSchema,
  type PaymentDetailResponse,
  type PaymentEventResponse,
  type PaymentPageResponse,
  type PaymentResponse,
  type RefundResponse,
} from "./backend";
import { PriceGroupSchema } from "../user/frontend";

// ---- enums: the same values in the app as on the wire

export const PaymentStatusSchema = PaymentStatusResponseSchema;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const RefundStatusSchema = RefundStatusResponseSchema;
export type RefundStatus = z.infer<typeof RefundStatusSchema>;

// The spec's event types, and `other` for any the app doesn't know yet. The
// wire accepts any string; this is where an unknown one becomes `other`, so a
// screen always has a label for it.
export const PaymentEventTypeSchema = z.enum([
  "payment_created",
  "payment_confirmed",
  "payment_declined",
  "refund_requested",
  "refund_completed",
  "refund_failed",
  "other",
]);
export type PaymentEventType = z.infer<typeof PaymentEventTypeSchema>;

const PaymentEventTypeOrOtherSchema = PaymentEventTypeSchema.catch("other");

// Why finance should look at a payment: the spec's reasons, and `other` for
// any the app doesn't know yet, so a screen always has words for it. The wire
// accepts any string, like the event types.
export const AttentionReasonSchema = z.enum([
  "pending_too_long",
  "refund_pending_too_long",
  "refund_failed",
  "other",
]);
export type AttentionReason = z.infer<typeof AttentionReasonSchema>;

const AttentionReasonOrOtherSchema = AttentionReasonSchema.catch("other");

// ---- shapes used in the app

// The same as on the wire: camelCase, whole cents, and the name in both
// languages so the screen picks one.
export const PaymentItemSchema = PaymentItemResponseSchema;

export interface PaymentItem extends z.infer<typeof PaymentItemSchema> {}

/**
 * A payment as the student app's history shows it. Only what a payer sees:
 * the payer and the attention flags are for the cashier and finance, and the
 * till's name only comes with the detail.
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

/**
 * A payment as the till lists it: the payer's fields, and what only the
 * cashier sees. Who paid, what can still be refunded, and whether finance
 * has flagged it.
 */
export const CashierPaymentSchema = PaymentSchema.extend({
  payerName: z.string(),
  refundableAmountCents: z.int().min(0),
  needsAttention: z.boolean(),
});

export interface CashierPayment extends z.infer<typeof CashierPaymentSchema> {}

/** One page of the till's payments, newest first. */
export const CashierPaymentPageSchema = z.object({
  payments: z.array(CashierPaymentSchema),
  /** Null on the last page. */
  nextCursor: z.string().min(1).nullable(),
});

export interface CashierPaymentPage extends z.infer<
  typeof CashierPaymentPageSchema
> {}

/**
 * A payment as the dashboard lists it: the payer's fields and everything
 * finance checks. Who paid, by id as well, since the search takes ids; where,
 * at which price group; what can still be refunded; and why it needs
 * attention.
 */
export const FinancePaymentSchema = PaymentSchema.extend({
  payerId: z.string().min(1),
  payerName: z.string(),
  priceGroup: PriceGroupSchema,
  mensaId: z.string().min(1),
  tillId: z.string().min(1),
  tillName: z.string(),
  refundableAmountCents: z.int().min(0),
  needsAttention: z.boolean(),
  attentionReasons: z.array(AttentionReasonSchema),
});

export interface FinancePayment extends z.infer<typeof FinancePaymentSchema> {}

/** One page of every mensa's payments, newest first. */
export const FinancePaymentPageSchema = z.object({
  payments: z.array(FinancePaymentSchema),
  /** Null on the last page. */
  nextCursor: z.string().min(1).nullable(),
});

export interface FinancePaymentPage extends z.infer<
  typeof FinancePaymentPageSchema
> {}

/** A refund as the payer sees it. A completed one is money back. */
export const RefundSchema = z.object({
  id: z.string().min(1),
  amountCents: z.int().min(0),
  status: RefundStatusSchema,
  reason: z.string().nullable(),
  createdAtMs: z.int(),
});

export interface Refund extends z.infer<typeof RefundSchema> {}

/**
 * One line of a payment's history. amountCents is the payment's or the
 * refund's amount, and null when the server doesn't name one.
 */
export const PaymentEventSchema = z.object({
  atMs: z.int(),
  type: PaymentEventTypeSchema,
  amountCents: z.int().min(0).nullable(),
});

export interface PaymentEvent extends z.infer<typeof PaymentEventSchema> {}

/**
 * A payment as the dashboard's detail screen shows it: the finance list's
 * fields, its refunds and its history.
 */
export const FinancePaymentDetailSchema = FinancePaymentSchema.extend({
  refunds: z.array(RefundSchema),
  /** Oldest first, as the server sends it. */
  history: z.array(PaymentEventSchema),
});

export interface FinancePaymentDetail extends z.infer<
  typeof FinancePaymentDetailSchema
> {}

/** A payment as its detail screen shows it: the list's fields and more. */
export const PaymentDetailSchema = PaymentSchema.extend({
  tillName: z.string(),
  refunds: z.array(RefundSchema),
  /** Oldest first, as the server sends it. */
  history: z.array(PaymentEventSchema),
});

export interface PaymentDetail extends z.infer<typeof PaymentDetailSchema> {}

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

export const toCashierPayment = (
  response: PaymentResponse,
): CashierPayment => ({
  ...toPayment(response),
  payerName: response.payer.displayName,
  refundableAmountCents: response.refundableAmountCents,
  needsAttention: response.needsAttention,
});

export const toCashierPaymentPage = (
  response: PaymentPageResponse,
): CashierPaymentPage => ({
  payments: response.items.map(toCashierPayment),
  nextCursor: response.nextCursor,
});

export const toFinancePayment = (
  response: PaymentResponse,
): FinancePayment => ({
  ...toPayment(response),
  payerId: response.payer.id,
  payerName: response.payer.displayName,
  priceGroup: response.priceGroup,
  mensaId: response.mensa.id,
  tillId: response.till.id,
  tillName: response.till.name,
  refundableAmountCents: response.refundableAmountCents,
  needsAttention: response.needsAttention,
  attentionReasons: response.attentionReasons.map((reason) =>
    AttentionReasonOrOtherSchema.parse(reason),
  ),
});

export const toFinancePaymentPage = (
  response: PaymentPageResponse,
): FinancePaymentPage => ({
  payments: response.items.map(toFinancePayment),
  nextCursor: response.nextCursor,
});

export const toRefund = (response: RefundResponse): Refund => ({
  id: response.id,
  amountCents: response.amountCents,
  status: response.status,
  reason: response.reason,
  createdAtMs: Date.parse(response.createdAt),
});

export const toPaymentEvent = (
  response: PaymentEventResponse,
): PaymentEvent => ({
  atMs: Date.parse(response.at),
  type: PaymentEventTypeOrOtherSchema.parse(response.type),
  amountCents: response.amountCents,
});

export const toPaymentDetail = (
  response: PaymentDetailResponse,
): PaymentDetail => ({
  ...toPayment(response),
  tillName: response.till.name,
  refunds: response.refunds.map(toRefund),
  history: response.history.map(toPaymentEvent),
});

export const toFinancePaymentDetail = (
  response: PaymentDetailResponse,
): FinancePaymentDetail => ({
  ...toFinancePayment(response),
  refunds: response.refunds.map(toRefund),
  history: response.history.map(toPaymentEvent),
});

/**
 * Of two copies of one payment, the later. The server can answer a read with
 * an earlier state, so a lower version never replaces a higher one: an old
 * `pending` must not undo `confirmed`. Works for a list row and a detail
 * alike, since both carry the payment's version.
 */
export const newerPayment = <PaymentCopy extends Payment>(
  cachedPayment: PaymentCopy | undefined,
  receivedPayment: PaymentCopy,
): PaymentCopy =>
  cachedPayment && cachedPayment.version > receivedPayment.version
    ? cachedPayment
    : receivedPayment;

/**
 * The loaded pages as one list, newest first. A payment made between two page
 * loads pushes the rest down, so one can come back on two pages: it is listed
 * once, where it first appeared, at its newer version. Works for the payer's
 * pages and the till's alike.
 */
export const toPaymentList = <ListedPayment extends Payment>(
  pages: { payments: ListedPayment[]; nextCursor: string | null }[],
): ListedPayment[] => {
  const paymentsById = new Map<string, ListedPayment>();
  for (const page of pages) {
    for (const payment of page.payments) {
      paymentsById.set(
        payment.id,
        newerPayment(paymentsById.get(payment.id), payment),
      );
    }
  }
  // A Map keeps the order keys were first set in, so updating one in place
  // leaves it where it was.
  return [...paymentsById.values()];
};

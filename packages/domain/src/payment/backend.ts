import { z } from "zod";
import { LocalizedTextResponseSchema } from "../mensa/backend";
import { RefResponseSchema } from "../order/backend";
import { PriceGroupResponseSchema } from "../user/backend";

// ---- what GET /payments takes, as query parameters

// Only paging for now. The spec's filters (mensa, till, status, dates, search)
// come with the dashboard, the first screen that sets them.
export const PaymentListRequestSchema = z.object({
  limit: z.int().min(1).max(200).optional(),
  cursor: z.string().min(1).optional(),
});

export interface PaymentListRequest extends z.infer<
  typeof PaymentListRequestSchema
> {}

// ---- a payment, as GET /payments lists it

/** pending: still being checked, which can last minutes. */
export const PaymentStatusResponseSchema = z.enum([
  "pending",
  "confirmed",
  "declined",
]);

export const PaymentItemResponseSchema = z.object({
  itemId: z.string().min(1),
  name: LocalizedTextResponseSchema,
  quantity: z.int().min(1),
  unitPriceCents: z.int().min(0),
});

export interface PaymentItemResponse extends z.infer<
  typeof PaymentItemResponseSchema
> {}

// Not `Payer`: that name is the app's logged-in payer in user/frontend, which
// has a price group. This is only who paid, as the payment names them.
export const PaymentPayerResponseSchema = z.object({
  id: z.string().min(1),
  displayName: z.string(),
});

export interface PaymentPayerResponse extends z.infer<
  typeof PaymentPayerResponseSchema
> {}

export const PaymentResponseSchema = z.object({
  id: z.string().min(1),
  orderId: z.string().min(1),
  status: PaymentStatusResponseSchema,
  amountCents: z.int().min(0),
  // Always EUR. Another currency should fail here, not be shown as euros.
  currency: z.literal("EUR").optional(),
  priceGroup: PriceGroupResponseSchema,
  mensa: RefResponseSchema,
  till: RefResponseSchema,
  payer: PaymentPayerResponseSchema,
  items: z.array(PaymentItemResponseSchema),
  refundedAmountCents: z.int().min(0),
  pendingRefundAmountCents: z.int().min(0),
  refundableAmountCents: z.int().min(0),
  needsAttention: z.boolean(),
  // Any string, not the spec's enum: like problem codes, a reason the app
  // doesn't know yet must not make the whole list fail to parse.
  attentionReasons: z.array(z.string().min(1)),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
  version: z.int().min(0),
});

export interface PaymentResponse extends z.infer<
  typeof PaymentResponseSchema
> {}

// ---- GET /payments: one page, newest first

export const PaymentPageResponseSchema = z.object({
  items: z.array(PaymentResponseSchema),
  /** Pass as `cursor` for the next page. Null on the last page. */
  nextCursor: z.string().min(1).nullable(),
});

export interface PaymentPageResponse extends z.infer<
  typeof PaymentPageResponseSchema
> {}

// ---- GET /payments/{paymentId}: a payment with its refunds and history

export const RefundStatusResponseSchema = z.enum([
  "pending",
  "completed",
  "failed",
]);

export const RefundResponseSchema = z.object({
  id: z.string().min(1),
  paymentId: z.string().min(1),
  amountCents: z.int().min(0),
  // Always EUR, as on the payment.
  currency: z.literal("EUR").optional(),
  status: RefundStatusResponseSchema,
  reason: z.string().nullable(),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
});

export interface RefundResponse extends z.infer<typeof RefundResponseSchema> {}

/** One state change of a payment or one of its refunds. */
export const PaymentEventResponseSchema = z.object({
  at: z.iso.datetime({ offset: true }),
  // Any string, not the spec's enum: like the attention reasons, an event the
  // app doesn't know yet must not stop the whole payment from loading. The
  // app names the ones it knows in frontend.ts.
  type: z.string().min(1),
  amountCents: z.int().min(0).nullable(),
  refundId: z.string().min(1).nullable(),
});

export interface PaymentEventResponse extends z.infer<
  typeof PaymentEventResponseSchema
> {}

// The list's payment plus its refunds and its history, oldest first.
export const PaymentDetailResponseSchema = PaymentResponseSchema.extend({
  refunds: z.array(RefundResponseSchema),
  history: z.array(PaymentEventResponseSchema),
});

export interface PaymentDetailResponse extends z.infer<
  typeof PaymentDetailResponseSchema
> {}

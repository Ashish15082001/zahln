import { z } from "zod";
import {
  LocalizedTextResponseSchema,
  PricesResponseSchema,
} from "../mensa/backend";
import { PriceGroupResponseSchema } from "../user/backend";

// ---- what POST /orders takes: the cart

export const OrderLineRequestSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.int().min(1).max(20),
});

export interface OrderLineRequest extends z.infer<
  typeof OrderLineRequestSchema
> {}

export const CreateOrderRequestSchema = z.object({
  items: z.array(OrderLineRequestSchema).min(1).max(20),
});

export interface CreateOrderRequest extends z.infer<
  typeof CreateOrderRequestSchema
> {}

// ---- an order, as POST /orders and GET /orders/{orderId} return it

/** open: can be paid. paying: a payment is being checked. expired: unpaid. */
export const OrderStatusResponseSchema = z.enum([
  "open",
  "paying",
  "paid",
  "expired",
]);

export const RefResponseSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
});

export interface RefResponse extends z.infer<typeof RefResponseSchema> {}

// The spec has the view-only fields as optional and nullable: each is filled
// for either the cashier or the payer, and null or missing for the other.
export const OrderLineResponseSchema = z.object({
  itemId: z.string().min(1),
  name: LocalizedTextResponseSchema,
  quantity: z.int().min(1),
  unitPrices: PricesResponseSchema.nullish(),
  unitPriceCents: z.int().min(0).nullish(),
});

export interface OrderLineResponse extends z.infer<
  typeof OrderLineResponseSchema
> {}

export const OrderResponseSchema = z.object({
  id: z.string().min(1),
  status: OrderStatusResponseSchema,
  mensa: RefResponseSchema,
  till: RefResponseSchema,
  items: z.array(OrderLineResponseSchema),
  qrPayload: z.string().min(1),
  // Always EUR. Another currency should fail here, not be shown as euros.
  currency: z.literal("EUR").optional(),
  amounts: PricesResponseSchema.nullish(),
  priceGroup: PriceGroupResponseSchema.nullish(),
  amountCents: z.int().min(0).nullish(),
  paymentId: z.string().min(1).nullish(),
  createdAt: z.iso.datetime({ offset: true }),
  expiresAt: z.iso.datetime({ offset: true }),
  version: z.int().min(0),
});

export interface OrderResponse extends z.infer<typeof OrderResponseSchema> {}

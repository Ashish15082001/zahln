import { OrderResponseSchema } from "@zahln/domain/order/backend";
import {
  toOrder,
  toPayerOrder,
  type Order,
  type PayerOrder,
} from "@zahln/domain/order/frontend";
import { ApiError } from "./errors";
import type { Http } from "./http";

/** GET /orders/{orderId}: the order as the cashier's till follows it. */
export const getOrder = async (
  http: Http,
  orderId: string,
  signal?: AbortSignal,
): Promise<Order> => {
  const response = await http.request({
    method: "GET",
    path: `/orders/${encodeURIComponent(orderId)}`,
    schema: OrderResponseSchema,
    authenticated: true,
    signal,
  });
  return toOrder(response);
};

/**
 * GET /orders/{orderId}: the order a payer scanned, at their price group's
 * price. A reply without those prices can't be shown to a payer, so it is
 * reported like any reply that doesn't match the spec.
 */
export const getPayerOrder = async (
  http: Http,
  orderId: string,
  signal?: AbortSignal,
): Promise<PayerOrder> => {
  const response = await http.request({
    method: "GET",
    path: `/orders/${encodeURIComponent(orderId)}`,
    schema: OrderResponseSchema,
    authenticated: true,
    signal,
  });
  const payerOrder = toPayerOrder(response);
  if (payerOrder === null) {
    throw new ApiError({
      kind: "invalidResponse",
      // Only a 2xx reaches here, and a GET's is 200.
      status: 200,
      issues: "the order has no price for the payer's price group",
    });
  }
  return payerOrder;
};

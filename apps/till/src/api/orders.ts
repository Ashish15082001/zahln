import {
  OrderResponseSchema,
  type CreateOrderRequest,
} from "@zahln/domain/order/backend";
import { toOrder, type Order } from "@zahln/domain/order/frontend";
import type { Http } from "@zahln/api/http";

/**
 * POST /orders: rings up the cart at the cashier's till. The key goes with
 * every attempt, so a retry gets back the same order instead of a second one.
 */
export const postOrder = async (
  http: Http,
  request: CreateOrderRequest,
  idempotencyKey: string,
): Promise<Order> => {
  const response = await http.request({
    method: "POST",
    path: "/orders",
    body: request,
    schema: OrderResponseSchema,
    idempotencyKey,
    authenticated: true,
  });
  return toOrder(response);
};

/** GET /orders/{orderId}: the order as the server has it now. */
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

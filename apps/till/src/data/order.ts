import { useMutation, useQuery } from "@tanstack/react-query";
import type { CreateOrderRequest } from "@zahln/domain/order/backend";
import { newerOrder, type Order } from "@zahln/domain/order/frontend";
import { isApiError, isOutcomeUnknown } from "@zahln/api/errors";
import { getOrder, postOrder } from "../api/orders";
import { queryClient } from "./queryClient";
import { http } from "./session";

/** What Create order sends: the cart, and the key for this intent. */
export interface CreateOrderInput {
  request: CreateOrderRequest;
  idempotencyKey: string;
}

/**
 * Rings up an order. The caller makes the key and keeps it, so Try again can
 * send it again and get back an order the server may already have saved.
 */
export const useCreateOrder = () =>
  useMutation({
    mutationFn: ({ request, idempotencyKey }: CreateOrderInput) =>
      postOrder(http, request, idempotencyKey),
  });

/**
 * Whether a failed create may still have made the order: the reply was lost
 * (502, 504, no answer). Then the next try must send the same key.
 */
export const isUnconfirmed = (error: unknown): boolean =>
  isApiError(error) && isOutcomeUnknown(error);

/** Paid or expired: nothing about the order changes after that. */
export const isSettled = (order: Order): boolean =>
  order.status === "paid" || order.status === "expired";

const POLL_MS = 2_000;

/**
 * The order as the server has it, starting from the one POST /orders gave
 * back and checked every 2 seconds until it's settled. It never goes back to
 * a lower version, since a read can return an earlier state.
 */
export const useOrder = (created: Order | null) =>
  useQuery({
    queryKey: ["order", created?.id ?? null] as const,
    queryFn: async ({ queryKey, signal }) => {
      const [, orderId] = queryKey;
      // enabled is false without an order, so this never runs then.
      if (orderId === null) throw new Error("No order to check");

      const next = await getOrder(http, orderId, signal);
      return newerOrder(queryClient.getQueryData<Order>(queryKey), next);
    },
    initialData: created ?? undefined,
    enabled: created !== null,
    refetchInterval: (query) => {
      const order = query.state.data;
      return order && isSettled(order) ? false : POLL_MS;
    },
    // The payer can pay while the till's screen is off or another app is in
    // front, and the till must still see it.
    refetchIntervalInBackground: true,
  });

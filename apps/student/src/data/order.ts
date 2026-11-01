import { useQuery } from "@tanstack/react-query";
import { hasProblemCode } from "@zahln/api/errors";
import { getPayerOrder } from "@zahln/api/orders";
import { newerOrder, type PayerOrder } from "@zahln/domain/order/frontend";
import { queryClient } from "./queryClient";
import { http, serverClock } from "./session";

const orderQueryKey = (orderId: string) => ["order", orderId] as const;

// After the countdown has run out the server still decides: the order is
// asked for again this often until it says expired, or paid.
const AFTER_EXPIRY_POLL_MS = 3_000;

/** The server's time now. Screens use it for an order's countdown. */
export const getServerNow = (): number => serverClock.now();

/**
 * Whether the order is still open on the server, though its time has run out
 * on the server's clock: the answer that says "expired" is on its way.
 */
const isOpenPastExpiry = (order: PayerOrder): boolean =>
  order.status === "open" && getServerNow() >= order.expiresAtMs;

/**
 * The order the payer scanned, at their price. Fetched when the screen opens
 * and when the app comes back to the front, like the payments. It never shows
 * a lower version than an earlier read.
 */
export const usePayerOrder = (orderId: string) =>
  useQuery({
    queryKey: orderQueryKey(orderId),
    queryFn: async ({ queryKey, signal }) => {
      const receivedOrder = await getPayerOrder(http, orderId, signal);
      return newerOrder(
        queryClient.getQueryData<PayerOrder>(queryKey),
        receivedOrder,
      );
    },
    // The route always has an id; this only keeps an empty one off the wire.
    enabled: orderId !== "",
    // Only "Expired" from the server is shown, never the app's own guess, so
    // once the time is up it keeps asking until the server agrees.
    refetchInterval: (query) => {
      const order = query.state.data;
      return order && isOpenPastExpiry(order) ? AFTER_EXPIRY_POLL_MS : false;
    },
  });

/** True when the server has no such order, e.g. from a mistyped code. */
export const isOrderNotFound = (error: unknown): boolean =>
  hasProblemCode(error, "not_found");

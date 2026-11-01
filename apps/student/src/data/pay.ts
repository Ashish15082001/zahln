import { useMutation } from "@tanstack/react-query";
import { isApiError, needsSameKey } from "@zahln/api/errors";
import { createPayIntentStore } from "@zahln/api/payIntentStore";
import { payOrder } from "@zahln/api/payments";
import { localKeyValueStorage } from "@zahln/api/sessionStore";
import { http } from "./session";

/** The payment being made, kept on the device until the server answers it. */
const payIntentStore = createPayIntentStore({
  storage: localKeyValueStorage,
  savedIntentKey: "zahln.student.payIntent.v1",
});

/** What Pay sends: the order, at the amount on screen. */
export interface PayOrderInput {
  orderId: string;
  amountCents: number;
}

/**
 * Pays an order at the amount shown. A retry of the same order and amount,
 * even after the app was closed, sends the same key, so a reply lost on the
 * way never leads to a second payment.
 */
export const usePayOrder = () =>
  useMutation({
    mutationFn: async ({ orderId, amountCents }: PayOrderInput) => {
      const idempotencyKey = payIntentStore.takeKey(orderId, amountCents);
      try {
        const payment = await payOrder(
          http,
          orderId,
          { amountCents },
          idempotencyKey,
        );
        // Declined or not, a payment came back for this key: paying again
        // is a new intent, and the old key would only replay this one.
        payIntentStore.spendKey(idempotencyKey);
        return payment;
      } catch (error) {
        if (!needsSameKey(error)) payIntentStore.spendKey(idempotencyKey);
        throw error;
      }
    },
  });

/** Why Pay didn't bring back a payment, as the screen explains it. */
export type PayFailure =
  // The reply was lost or the server was busy: the payment may have gone
  // through. Sending it again with the same key finds out, and can't pay
  // twice.
  | "unconfirmed"
  | "priceChanged"
  | "orderExpired"
  | "orderPaid"
  | "orderPaying"
  | "orderNotFound"
  | "updateRequired"
  | "paymentsPaused"
  | "failed";

export const toPayFailure = (error: unknown): PayFailure => {
  const problemCode =
    isApiError(error) && error.failure.kind === "problem"
      ? error.failure.problem.code
      : null;

  switch (problemCode) {
    case "amount_mismatch":
      return "priceChanged";
    case "order_expired":
      return "orderExpired";
    case "order_already_paid":
      return "orderPaid";
    case "order_payment_in_progress":
      return "orderPaying";
    case "not_found":
      return "orderNotFound";
    case "app_version_unsupported":
      return "updateRequired";
    case "payments_disabled":
      return "paymentsPaused";
  }
  return needsSameKey(error) ? "unconfirmed" : "failed";
};

/**
 * The server answered from a newer order than the one on screen, so the
 * screen reads it again to show what changed: the price, or why it can't be
 * paid.
 */
export const isOrderOutOfDate = (payFailure: PayFailure): boolean =>
  payFailure === "priceChanged" ||
  payFailure === "orderExpired" ||
  payFailure === "orderPaid" ||
  payFailure === "orderPaying" ||
  payFailure === "orderNotFound";

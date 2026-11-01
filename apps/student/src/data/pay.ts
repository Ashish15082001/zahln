import { useMutation } from "@tanstack/react-query";
import { isApiError, needsSameKey } from "@zahln/api/errors";
import { createPayIntentStore } from "@zahln/api/payIntentStore";
import { payOrder } from "@zahln/api/payments";
import { localKeyValueStorage } from "@zahln/api/sessionStore";
import {
  identityCheck,
  type ConfirmIdentityOptions,
  type IdentityCheckResult,
} from "@zahln/native/identityCheck";
import { useState } from "react";
import { http } from "./session";

/** The payment being made, kept on the device until the server answers it. */
const payIntentStore = createPayIntentStore({
  storage: localKeyValueStorage,
  savedIntentKey: "zahln.student.payIntent.v1",
});

/** How the phone's check that the payer is holding it can end without a yes. */
type PayerCheckFailure = Exclude<
  IdentityCheckResult["kind"],
  "confirmed" | "unavailable"
>;

/** The payer didn't confirm it's them, so nothing was sent. */
class PayerNotConfirmedError extends Error {
  readonly payerCheckFailure: PayerCheckFailure;

  constructor(payerCheckFailure: PayerCheckFailure) {
    super(`The payer check ended: ${payerCheckFailure}`);
    this.name = "PayerNotConfirmedError";
    this.payerCheckFailure = payerCheckFailure;
  }
}

/**
 * Asks for a fingerprint, the face or the phone's PIN, and throws unless the
 * payer passes. A phone without a screen lock pays without the check:
 * whoever holds it can already open everything on it, and an emulator
 * usually has none.
 */
const confirmPayer = async (
  payerCheckPrompt: ConfirmIdentityOptions,
): Promise<void> => {
  const payerCheck = await identityCheck.confirmIdentity(payerCheckPrompt);
  if (payerCheck.kind === "confirmed" || payerCheck.kind === "unavailable") {
    return;
  }
  throw new PayerNotConfirmedError(payerCheck.kind);
};

/** What Pay sends: the order, at the amount on screen. */
export interface PayOrderInput {
  orderId: string;
  amountCents: number;
  /** What the phone's prompt says, in the payer's language. */
  payerCheckPrompt: ConfirmIdentityOptions;
}

/**
 * Pays an order at the amount shown, once the payer has confirmed it's them.
 * The check is in here, not on the screen, so no screen can send a payment
 * without it. A retry of the same order and amount, even after the app was
 * closed, sends the same key, so a reply lost on the way never leads to a
 * second payment.
 */
export const usePayOrder = () => {
  // While the phone's prompt is open, so the footer can say "Confirming…"
  // rather than "Paying…": nothing has been sent yet.
  const [isCheckingPayer, setIsCheckingPayer] = useState(false);

  const payMutation = useMutation({
    mutationFn: async ({
      orderId,
      amountCents,
      payerCheckPrompt,
    }: PayOrderInput) => {
      // A saved key means the payer confirmed this payment already and its
      // answer never came: sending it again under that key asks nothing
      // new, so it doesn't ask again. A key is only made after the check.
      if (!payIntentStore.hasKey(orderId, amountCents)) {
        setIsCheckingPayer(true);
        try {
          await confirmPayer(payerCheckPrompt);
        } finally {
          setIsCheckingPayer(false);
        }
      }

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

  return { isCheckingPayer, payMutation };
};

/** Why Pay didn't bring back a payment, as the screen explains it. */
export type PayFailure =
  // The payer closed the phone's prompt. Nothing was sent, and there is
  // nothing to explain.
  | "payerCheckCancelled"
  // Too many misread fingers or faces. Nothing was sent.
  | "payerLockedOut"
  // The phone couldn't check it's the payer. Nothing was sent.
  | "payerCheckFailed"
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
  if (error instanceof PayerNotConfirmedError) {
    switch (error.payerCheckFailure) {
      case "cancelled":
        return "payerCheckCancelled";
      case "lockedOut":
        return "payerLockedOut";
      case "failed":
        return "payerCheckFailed";
    }
  }

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

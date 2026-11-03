import { newIdempotencyKey } from "./idempotencyKey";

/**
 * The payment the payer is making: which order, at which amount, under which
 * key. The same order at another amount is another intent, since the server
 * refuses one key with two bodies.
 */
interface PayIntent {
  orderId: string;
  amountCents: number;
  idempotencyKey: string;
}

/** What `createPayIntentStore` gives back. */
export interface PayIntentStore {
  /**
   * Whether a key is kept for `orderId` at `amountCents`: this payment was
   * sent before, or was about to be, and no answer settled it. `takeKey`
   * then hands out that same key.
   */
  hasKey: (orderId: string, amountCents: number) => boolean;
  /**
   * The key to pay `orderId` at `amountCents` with. The kept one when it is
   * for this same order and amount, so a retry gets back the payment the
   * server may already have. Otherwise a new one.
   */
  takeKey: (orderId: string, amountCents: number) => string;
  /**
   * Forgets `idempotencyKey`: a payment came back for it, or the server
   * refused it for good. A newer intent made in the meantime is kept.
   */
  spendKey: (idempotencyKey: string) => void;
  /** Forgets whatever key is kept: the payer logged out. */
  forgetIntent: () => void;
}

/** Settings for `createPayIntentStore`. */
export interface PayIntentStoreConfig {
  /** Makes a new key. Tests pass one that counts. */
  newKey?: () => string;
}

/**
 * Keeps one pay intent in memory, so a payment whose reply was lost is sent
 * again under the same key while the app runs. One is enough: a payer pays
 * one order at a time.
 *
 * Not saved on the device: after a reopen, Pay makes a new key, and the
 * server refuses a new key for an order whose payment is pending or paid. A
 * saved key would only skip the payer check for whoever holds the phone next.
 */
export const createPayIntentStore = (
  config: PayIntentStoreConfig = {},
): PayIntentStore => {
  const { newKey = () => newIdempotencyKey("payment") } = config;

  let payIntent: PayIntent | null = null;

  const hasKey = (orderId: string, amountCents: number): boolean =>
    payIntent?.orderId === orderId && payIntent.amountCents === amountCents;

  return {
    hasKey,
    takeKey: (orderId, amountCents) => {
      if (payIntent !== null && hasKey(orderId, amountCents)) {
        return payIntent.idempotencyKey;
      }
      payIntent = { orderId, amountCents, idempotencyKey: newKey() };
      return payIntent.idempotencyKey;
    },
    spendKey: (idempotencyKey) => {
      // Another order's pay may have started since this one was sent; its
      // key is not this one's to forget.
      if (payIntent?.idempotencyKey !== idempotencyKey) return;
      payIntent = null;
    },
    forgetIntent: () => {
      payIntent = null;
    },
  };
};

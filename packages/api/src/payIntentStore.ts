import { z } from "zod";
import { newIdempotencyKey } from "./idempotencyKey";
import type { KeyValueStorage } from "./sessionStore";

/**
 * The payment the payer is making: which order, at which amount, under which
 * key. The same order at another amount is another intent, since the server
 * refuses one key with two bodies.
 */
const PayIntentSchema = z.object({
  orderId: z.string().min(1),
  amountCents: z.int().min(1),
  // The spec allows 1 to 255 characters.
  idempotencyKey: z.string().min(1).max(255),
});

interface PayIntent extends z.infer<typeof PayIntentSchema> {}

/** What `createPayIntentStore` gives back. */
export interface PayIntentStore {
  /**
   * The key to pay `orderId` at `amountCents` with. The saved one when it is
   * for this same order and amount, so a retry gets back the payment the
   * server may already have. Otherwise a new one, saved before it is
   * returned, so it is on the device before the first send.
   */
  takeKey: (orderId: string, amountCents: number) => string;
  /**
   * Forgets `idempotencyKey`: a payment came back for it, or the server
   * refused it for good. A newer intent saved in the meantime is kept.
   */
  spendKey: (idempotencyKey: string) => void;
}

/** Settings for `createPayIntentStore`. */
export interface PayIntentStoreConfig {
  storage: KeyValueStorage;
  /**
   * The key the intent is kept under, with a version in it, e.g.
   * `zahln.student.payIntent.v1`. A later shape gets a new key.
   */
  savedIntentKey: string;
  /** Makes a new key. Tests pass one that counts. */
  newKey?: () => string;
}

/**
 * Keeps one pay intent, in memory and on the device, so a payment whose
 * reply was lost is sent again under the same key, even after the app was
 * closed in between. One is enough: a payer pays one order at a time.
 */
export const createPayIntentStore = (
  config: PayIntentStoreConfig,
): PayIntentStore => {
  const {
    storage,
    savedIntentKey,
    newKey = () => newIdempotencyKey("payment"),
  } = config;

  /** What is saved, checked against the schema. */
  const readSavedIntent = (): PayIntent | null => {
    try {
      const savedText = storage.get(savedIntentKey);
      if (savedText === null) return null;
      const parseResult = PayIntentSchema.safeParse(JSON.parse(savedText));
      return parseResult.success ? parseResult.data : null;
    } catch {
      // Storage the WebView won't open, or text that isn't JSON.
      return null;
    }
  };

  // Read from storage once. Memory is what counts after that, so storage
  // that can't be written still keeps the key while the app runs.
  let payIntent = readSavedIntent();

  return {
    takeKey: (orderId, amountCents) => {
      if (
        payIntent?.orderId === orderId &&
        payIntent.amountCents === amountCents
      ) {
        return payIntent.idempotencyKey;
      }
      const newPayIntent: PayIntent = {
        orderId,
        amountCents,
        idempotencyKey: newKey(),
      };
      payIntent = newPayIntent;
      try {
        storage.set(savedIntentKey, JSON.stringify(newPayIntent));
      } catch {
        // Full or blocked storage: the key is kept until the app closes.
      }
      return newPayIntent.idempotencyKey;
    },
    spendKey: (idempotencyKey) => {
      // Another order's pay may have started since this one was sent; its
      // key is not this one's to forget.
      if (payIntent?.idempotencyKey !== idempotencyKey) return;
      payIntent = null;
      try {
        storage.remove(savedIntentKey);
      } catch {
        // Storage that can't be written: memory has already let go.
      }
    },
  };
};

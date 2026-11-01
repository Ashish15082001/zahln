import { describe, expect, it } from "vitest";
import { createPayIntentStore } from "./payIntentStore";
import type { KeyValueStorage } from "./sessionStore";

const SAVED_INTENT_KEY = "zahln.student.payIntent.v1";

/** localStorage as a Map, with the Map open so tests can look inside. */
const createFakeStorage = () => {
  const savedTexts = new Map<string, string>();
  const storage: KeyValueStorage = {
    get: (key) => savedTexts.get(key) ?? null,
    set: (key, value) => savedTexts.set(key, value),
    remove: (key) => savedTexts.delete(key),
  };
  return { savedTexts, storage };
};

/** Storage the WebView won't open: every call throws. */
const brokenStorage: KeyValueStorage = {
  get: () => {
    throw new Error("storage unavailable");
  },
  set: () => {
    throw new Error("storage unavailable");
  },
  remove: () => {
    throw new Error("storage unavailable");
  },
};

/** Keys `payment_1`, `payment_2`… in the order they are made. */
const countingKeys = () => {
  let count = 0;
  return () => {
    count += 1;
    return `payment_${count}`;
  };
};

const setup = (storage: KeyValueStorage) =>
  createPayIntentStore({
    storage,
    savedIntentKey: SAVED_INTENT_KEY,
    newKey: countingKeys(),
  });

describe("createPayIntentStore", () => {
  it("saves a new key before handing it out", () => {
    const { savedTexts, storage } = createFakeStorage();
    const payIntentStore = setup(storage);

    const idempotencyKey = payIntentStore.takeKey("ord_1", 410);

    expect(idempotencyKey).toBe("payment_1");
    expect(JSON.parse(savedTexts.get(SAVED_INTENT_KEY) ?? "null")).toEqual({
      orderId: "ord_1",
      amountCents: 410,
      idempotencyKey: "payment_1",
    });
  });

  it("hands out the same key again for the same order and amount", () => {
    const payIntentStore = setup(createFakeStorage().storage);

    const firstKey = payIntentStore.takeKey("ord_1", 410);

    expect(payIntentStore.takeKey("ord_1", 410)).toBe(firstKey);
  });

  it("makes a new key for a changed amount or another order", () => {
    const payIntentStore = setup(createFakeStorage().storage);

    expect(payIntentStore.takeKey("ord_1", 410)).toBe("payment_1");
    expect(payIntentStore.takeKey("ord_1", 450)).toBe("payment_2");
    expect(payIntentStore.takeKey("ord_2", 450)).toBe("payment_3");
  });

  it("finds the saved key after the app was closed", () => {
    const { storage } = createFakeStorage();
    const idempotencyKey = setup(storage).takeKey("ord_1", 410);

    const reopenedStore = setup(storage);

    expect(reopenedStore.takeKey("ord_1", 410)).toBe(idempotencyKey);
  });

  it("makes a new key once the old one is spent, on the device too", () => {
    const { savedTexts, storage } = createFakeStorage();
    const payIntentStore = setup(storage);
    const spentKey = payIntentStore.takeKey("ord_1", 410);

    payIntentStore.spendKey(spentKey);

    expect(savedTexts.has(SAVED_INTENT_KEY)).toBe(false);
    expect(payIntentStore.takeKey("ord_1", 410)).toBe("payment_2");
  });

  it("keeps a newer intent when an older key is spent", () => {
    const payIntentStore = setup(createFakeStorage().storage);
    const olderKey = payIntentStore.takeKey("ord_1", 410);
    const newerKey = payIntentStore.takeKey("ord_2", 320);

    payIntentStore.spendKey(olderKey);

    expect(payIntentStore.takeKey("ord_2", 320)).toBe(newerKey);
  });

  it("ignores a broken save and makes a new key", () => {
    const { savedTexts, storage } = createFakeStorage();
    savedTexts.set(SAVED_INTENT_KEY, '{"orderId":"ord_1"');

    expect(setup(storage).takeKey("ord_1", 410)).toBe("payment_1");
  });

  it("keeps the key in memory when storage won't open", () => {
    const payIntentStore = setup(brokenStorage);

    const idempotencyKey = payIntentStore.takeKey("ord_1", 410);

    expect(payIntentStore.takeKey("ord_1", 410)).toBe(idempotencyKey);
    expect(() => payIntentStore.spendKey(idempotencyKey)).not.toThrow();
  });
});

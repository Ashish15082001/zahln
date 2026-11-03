import { describe, expect, it } from "vitest";
import { createPayIntentStore } from "./payIntentStore";

/** Keys `payment_1`, `payment_2`… in the order they are made. */
const countingKeys = () => {
  let count = 0;
  return () => {
    count += 1;
    return `payment_${count}`;
  };
};

const setup = () => createPayIntentStore({ newKey: countingKeys() });

describe("createPayIntentStore", () => {
  it("hands out the same key again for the same order and amount", () => {
    const payIntentStore = setup();

    const firstKey = payIntentStore.takeKey("ord_1", 410);

    expect(payIntentStore.takeKey("ord_1", 410)).toBe(firstKey);
  });

  it("makes a new key for a changed amount or another order", () => {
    const payIntentStore = setup();

    expect(payIntentStore.takeKey("ord_1", 410)).toBe("payment_1");
    expect(payIntentStore.takeKey("ord_1", 450)).toBe("payment_2");
    expect(payIntentStore.takeKey("ord_2", 450)).toBe("payment_3");
  });

  it("says whether a key is kept for this order and amount", () => {
    const payIntentStore = setup();
    expect(payIntentStore.hasKey("ord_1", 410)).toBe(false);

    const idempotencyKey = payIntentStore.takeKey("ord_1", 410);

    expect(payIntentStore.hasKey("ord_1", 410)).toBe(true);
    expect(payIntentStore.hasKey("ord_1", 450)).toBe(false);
    expect(payIntentStore.hasKey("ord_2", 410)).toBe(false);
    payIntentStore.spendKey(idempotencyKey);
    expect(payIntentStore.hasKey("ord_1", 410)).toBe(false);
  });

  it("starts with no key, as after a reopen", () => {
    setup().takeKey("ord_1", 410);

    const reopenedStore = setup();

    expect(reopenedStore.hasKey("ord_1", 410)).toBe(false);
  });

  it("makes a new key once the old one is spent", () => {
    const payIntentStore = setup();
    const spentKey = payIntentStore.takeKey("ord_1", 410);

    payIntentStore.spendKey(spentKey);

    expect(payIntentStore.takeKey("ord_1", 410)).toBe("payment_2");
  });

  it("keeps a newer intent when an older key is spent", () => {
    const payIntentStore = setup();
    const olderKey = payIntentStore.takeKey("ord_1", 410);
    const newerKey = payIntentStore.takeKey("ord_2", 320);

    payIntentStore.spendKey(olderKey);

    expect(payIntentStore.takeKey("ord_2", 320)).toBe(newerKey);
  });

  it("forgets the key on log out, so the next payer gets a new one", () => {
    const payIntentStore = setup();
    payIntentStore.takeKey("ord_1", 410);

    payIntentStore.forgetIntent();

    expect(payIntentStore.hasKey("ord_1", 410)).toBe(false);
    expect(payIntentStore.takeKey("ord_1", 410)).toBe("payment_2");
  });
});

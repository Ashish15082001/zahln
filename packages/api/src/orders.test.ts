import { describe, expect, it } from "vitest";
import { createServerClock } from "./clock";
import { ApiError } from "./errors";
import { createHttp } from "./http";
import { getOrder, getPayerOrder } from "./orders";
import {
  createFakeServer,
  jsonReply,
  problemReply,
  type Reply,
} from "./testing/fakeServer";

/** An order as the server sends it to the cashier who made it. */
const cashierOrder = {
  id: "ord_1",
  status: "open",
  mensa: { id: "mensa_campus", name: "Mensa am Campus" },
  till: { id: "till_campus_1", name: "Kasse 1" },
  items: [
    {
      itemId: "item_campus_curry",
      name: { de: "Currywurst", en: "Currywurst" },
      quantity: 2,
      unitPrices: { student: 320, staff: 450, guest: 590 },
    },
  ],
  qrPayload: "zahln://pay?order=ord_1",
  currency: "EUR",
  amounts: { student: 640, staff: 900, guest: 1180 },
  paymentId: null,
  createdAt: "2026-10-31T12:00:00Z",
  expiresAt: "2026-10-31T12:05:00Z",
  version: 1,
};

/** The same order as a student who scanned it gets it: their price only. */
const payerOrder = {
  ...cashierOrder,
  items: [
    {
      itemId: "item_campus_curry",
      name: { de: "Currywurst", en: "Currywurst" },
      quantity: 2,
      unitPrices: null,
      unitPriceCents: 320,
    },
  ],
  amounts: null,
  priceGroup: "student",
  amountCents: 640,
};

/** A server that answers each request with the next of `replies`. */
const setup = (replies: (() => Reply)[]) => {
  let index = 0;
  const server = createFakeServer(() => {
    const reply = replies[Math.min(index, replies.length - 1)];
    index += 1;
    return reply ? reply() : "network";
  });
  const http = createHttp({
    baseUrl: "https://api.test",
    candidateId: "c_test",
    appVersion: "1.0.0",
    clock: createServerClock(),
    auth: {
      getToken: () => Promise.resolve("t1"),
      renew: () => Promise.resolve("t1"),
      markEnded: () => undefined,
    },
    fetch: server.fetch,
    sleep: () => Promise.resolve(),
  });
  return { http, server };
};

describe("getOrder", () => {
  it("reads the order with the token and no key", async () => {
    const { http, server } = setup([
      () => jsonReply(200, { ...cashierOrder, status: "paid", version: 3 }),
    ]);

    const read = await getOrder(http, "ord_1");

    expect(read.status).toBe("paid");
    expect(read.version).toBe(3);
    const [call] = server.calls;
    expect(call?.path).toBe("/orders/ord_1");
    expect(call?.headers.get("Idempotency-Key")).toBeNull();
  });
});

describe("getPayerOrder", () => {
  it("reads the order at the payer's price", async () => {
    const { http, server } = setup([() => jsonReply(200, payerOrder)]);

    const read = await getPayerOrder(http, "ord_1");

    expect(read.amountCents).toBe(640);
    expect(read.priceGroup).toBe("student");
    expect(read.items[0]?.unitPriceCents).toBe(320);
    expect(read.tillName).toBe("Kasse 1");
    const [call] = server.calls;
    expect(call?.path).toBe("/orders/ord_1");
    expect(call?.headers.get("Authorization")).toBe("Bearer t1");
  });

  it("refuses the cashier's view, which has no price for the payer", async () => {
    const { http } = setup([() => jsonReply(200, cashierOrder)]);

    const error: unknown = await getPayerOrder(http, "ord_1").catch(
      (reason: unknown) => reason,
    );

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).failure).toMatchObject({
      kind: "invalidResponse",
      status: 200,
    });
  });

  it("reports an unknown order as not found, without asking again", async () => {
    const { http, server } = setup([
      () => problemReply(404, "not_found", false),
    ]);

    const error: unknown = await getPayerOrder(http, "ord_missing").catch(
      (reason: unknown) => reason,
    );

    expect((error as ApiError).failure).toMatchObject({
      kind: "problem",
      status: 404,
      problem: { code: "not_found" },
    });
    expect(server.calls).toHaveLength(1);
  });
});

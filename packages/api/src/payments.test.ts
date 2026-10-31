import { describe, expect, it } from "vitest";
import { createServerClock } from "./clock";
import { ApiError } from "./errors";
import { createHttp } from "./http";
import { getPayments } from "./payments";
import {
  createFakeServer,
  describeCalls,
  jsonReply,
  problemReply,
  type Reply,
} from "./testing/fakeServer";

/** A payment as the real server lists it for the student. */
const payment = {
  id: "pay_b363fa8001a7cbd1",
  orderId: "ord_f494ab66c7ee64d4",
  status: "confirmed",
  amountCents: 410,
  currency: "EUR",
  priceGroup: "student",
  mensa: { id: "mensa_nord", name: "Mensa Nord" },
  till: { id: "till_nord_1", name: "Kasse 1" },
  payer: { id: "usr_student", displayName: "Test Student" },
  items: [
    {
      itemId: "item_nord_meat",
      name: { de: "Tagesgericht mit Fleisch", en: "Meat dish of the day" },
      quantity: 1,
      unitPriceCents: 410,
    },
  ],
  refundedAmountCents: 0,
  pendingRefundAmountCents: 0,
  refundableAmountCents: 410,
  needsAttention: false,
  attentionReasons: [],
  createdAt: "2026-10-28T11:40:14.727Z",
  updatedAt: "2026-10-28T11:40:17.727Z",
  version: 2,
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

describe("getPayments", () => {
  it("asks for the first page with the token and no key", async () => {
    const { http, server } = setup([
      () => jsonReply(200, { items: [payment], nextCursor: "cursor_2" }),
    ]);

    const page = await getPayments(http, { limit: 20 });

    expect(page.payments.map((listed) => listed.id)).toEqual([
      "pay_b363fa8001a7cbd1",
    ]);
    expect(page.nextCursor).toBe("cursor_2");
    expect(describeCalls(server.calls)).toEqual(["GET /payments?limit=20"]);
    const [call] = server.calls;
    expect(call?.headers.get("Authorization")).toBe("Bearer t1");
    expect(call?.headers.get("Idempotency-Key")).toBeNull();
  });

  it("sends the cursor for the next page", async () => {
    const { http, server } = setup([
      () => jsonReply(200, { items: [payment], nextCursor: null }),
    ]);

    const page = await getPayments(http, { limit: 20, cursor: "cursor_2" });

    expect(page.nextCursor).toBeNull();
    expect(describeCalls(server.calls)).toEqual([
      "GET /payments?limit=20&cursor=cursor_2",
    ]);
  });

  it("asks again when the server is briefly unavailable", async () => {
    const { http, server } = setup([
      () => problemReply(503, "unavailable", true),
      () => jsonReply(200, { items: [payment], nextCursor: null }),
    ]);

    const page = await getPayments(http, { limit: 20 });

    expect(page.payments).toHaveLength(1);
    expect(server.calls).toHaveLength(2);
  });

  it("refuses a page with a status the app doesn't know", async () => {
    const { http, server } = setup([
      () =>
        jsonReply(200, {
          items: [{ ...payment, status: "refunded" }],
          nextCursor: null,
        }),
    ]);

    const error: unknown = await getPayments(http, { limit: 20 }).catch(
      (reason: unknown) => reason,
    );

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).failure).toMatchObject({
      kind: "invalidResponse",
      status: 200,
    });
    // A bad 200 is not a passing failure, so it isn't asked again.
    expect(server.calls).toHaveLength(1);
  });
});

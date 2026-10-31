import { describe, expect, it } from "vitest";
import { createServerClock } from "../../api/clock";
import { createHttp } from "../../api/http";
import { getOrder, postOrder } from "../../api/orders";
import {
  createFakeServer,
  describeCalls,
  jsonReply,
  problemReply,
  type Reply,
} from "../support/fakeServer";

/** An order as the real server sends it to the cashier who made it. */
const order = {
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
  qrPayload: "zahln://order/ord_1",
  currency: "EUR",
  amounts: { student: 640, staff: 900, guest: 1180 },
  paymentId: null,
  createdAt: "2026-10-31T12:00:00Z",
  expiresAt: "2026-10-31T12:05:00Z",
  version: 1,
};

const cart = { items: [{ itemId: "item_campus_curry", quantity: 2 }] };

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

describe("postOrder", () => {
  it("sends the cart with the token and the key", async () => {
    const { http, server } = setup([() => jsonReply(201, order)]);

    const created = await postOrder(http, cart, "order_k1");

    expect(created.id).toBe("ord_1");
    expect(created.status).toBe("open");
    const [call] = server.calls;
    expect(call?.method).toBe("POST");
    expect(call?.path).toBe("/orders");
    expect(call?.body).toEqual(cart);
    expect(call?.headers.get("Authorization")).toBe("Bearer t1");
    expect(call?.headers.get("Idempotency-Key")).toBe("order_k1");
  });

  it("resends a lost reply with the same key, so it can't make two orders", async () => {
    const { http, server } = setup([
      () => problemReply(504, "timeout", true),
      () => jsonReply(201, order),
    ]);

    await postOrder(http, cart, "order_k1");

    expect(describeCalls(server.calls)).toEqual([
      "POST /orders",
      "POST /orders",
    ]);
    expect(
      server.calls.map((call) => call.headers.get("Idempotency-Key")),
    ).toEqual(["order_k1", "order_k1"]);
  });
});

describe("getOrder", () => {
  it("reads the order with the token and no key", async () => {
    const { http, server } = setup([
      () => jsonReply(200, { ...order, status: "paid", version: 3 }),
    ]);

    const read = await getOrder(http, "ord_1");

    expect(read.status).toBe("paid");
    expect(read.version).toBe(3);
    const [call] = server.calls;
    expect(call?.path).toBe("/orders/ord_1");
    expect(call?.headers.get("Idempotency-Key")).toBeNull();
  });
});

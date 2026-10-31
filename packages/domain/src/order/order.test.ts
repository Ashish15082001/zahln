import { describe, expect, it } from "vitest";
import { CreateOrderRequestSchema, OrderResponseSchema } from "./backend";
import { newerOrder, toOrder, toOrderIdFromQr, type Order } from "./frontend";

/** An order as the server sends it to the cashier who made it. */
const orderResponse = {
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
  priceGroup: null,
  amountCents: null,
  paymentId: null,
  createdAt: "2026-10-31T12:00:00Z",
  expiresAt: "2026-10-31T12:05:00Z",
  version: 1,
};

const order = (version: number, status: Order["status"]): Order => ({
  id: "ord_1",
  status,
  qrPayload: "zahln://order/ord_1",
  expiresAtMs: 0,
  version,
  paymentId: null,
});

describe("CreateOrderRequestSchema", () => {
  it("takes 1 to 20 of each dish", () => {
    const items = (quantity: number) => ({
      items: [{ itemId: "item_campus_curry", quantity }],
    });

    expect(CreateOrderRequestSchema.safeParse(items(1)).success).toBe(true);
    expect(CreateOrderRequestSchema.safeParse(items(20)).success).toBe(true);
    expect(CreateOrderRequestSchema.safeParse(items(0)).success).toBe(false);
    expect(CreateOrderRequestSchema.safeParse(items(21)).success).toBe(false);
  });

  it("refuses an empty order", () => {
    expect(CreateOrderRequestSchema.safeParse({ items: [] }).success).toBe(
      false,
    );
  });
});

describe("OrderResponseSchema", () => {
  it("parses an order", () => {
    expect(OrderResponseSchema.safeParse(orderResponse).success).toBe(true);
  });

  it("refuses a status it doesn't know", () => {
    const parsed = OrderResponseSchema.safeParse({
      ...orderResponse,
      status: "refunded",
    });

    expect(parsed.success).toBe(false);
  });
});

describe("toOrder", () => {
  it("keeps what the till needs and turns the expiry into milliseconds", () => {
    const parsed = OrderResponseSchema.parse(orderResponse);

    expect(toOrder(parsed)).toEqual({
      id: "ord_1",
      status: "open",
      qrPayload: "zahln://order/ord_1",
      expiresAtMs: Date.UTC(2026, 9, 31, 12, 5, 0),
      version: 1,
      paymentId: null,
    });
  });
});

describe("newerOrder", () => {
  it("never goes back to a lower version", () => {
    const paid = order(3, "paid");

    expect(newerOrder(paid, order(2, "open"))).toBe(paid);
  });

  it("takes a higher version", () => {
    const paid = order(3, "paid");

    expect(newerOrder(order(2, "paying"), paid)).toBe(paid);
  });

  it("takes the reply when there is nothing yet", () => {
    const open = order(1, "open");

    expect(newerOrder(undefined, open)).toBe(open);
  });
});

describe("toOrderIdFromQr", () => {
  it("reads the order id from the till's QR code", () => {
    // The qrPayload the dev server sends for this order.
    expect(toOrderIdFromQr("zahln://pay?order=ord_c0fa341c0c64bffc")).toBe(
      "ord_c0fa341c0c64bffc",
    );
  });

  it("ignores spaces around the text and other parameters", () => {
    expect(toOrderIdFromQr("  zahln://pay?v=2&order=ord_1\n")).toBe("ord_1");
  });

  it("refuses a QR code that isn't a Zahln order", () => {
    expect(toOrderIdFromQr("https://zahln.de/pay?order=ord_1")).toBeNull();
    expect(toOrderIdFromQr("WIFI:S:Mensa;T:WPA;P:secret;;")).toBeNull();
    expect(toOrderIdFromQr("ord_c0fa341c0c64bffc")).toBeNull();
    expect(toOrderIdFromQr("")).toBeNull();
  });

  it("refuses a Zahln code without a usable order id", () => {
    expect(toOrderIdFromQr("zahln://pay?")).toBeNull();
    expect(toOrderIdFromQr("zahln://pay?order=")).toBeNull();
    expect(toOrderIdFromQr("zahln://pay?order=../payments")).toBeNull();
    expect(toOrderIdFromQr("zahln://pay?order=ord%201")).toBeNull();
  });
});

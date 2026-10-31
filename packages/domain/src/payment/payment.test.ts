import { describe, expect, it } from "vitest";
import {
  PaymentListRequestSchema,
  PaymentPageResponseSchema,
  PaymentResponseSchema,
} from "./backend";
import {
  newerPayment,
  toPayment,
  toPaymentPage,
  type Payment,
} from "./frontend";

// A real GET /payments item from the dev server, as the student sees it.
const paymentResponse = {
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
      itemId: "item_nord_dessert",
      name: { de: "Dessert", en: "Dessert" },
      quantity: 1,
      unitPriceCents: 90,
    },
    {
      itemId: "item_nord_meat",
      name: { de: "Tagesgericht mit Fleisch", en: "Meat dish of the day" },
      quantity: 1,
      unitPriceCents: 320,
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

const payment = (version: number, status: Payment["status"]): Payment => ({
  id: "pay_1",
  orderId: "ord_1",
  status,
  amountCents: 320,
  mensaName: "Mensa Nord",
  items: [],
  refundedAmountCents: 0,
  pendingRefundAmountCents: 0,
  createdAtMs: 0,
  version,
});

describe("PaymentListRequestSchema", () => {
  it("takes a page size of 1 to 200", () => {
    const limit = (pageSize: number) =>
      PaymentListRequestSchema.safeParse({ limit: pageSize }).success;

    expect(limit(1)).toBe(true);
    expect(limit(200)).toBe(true);
    expect(limit(0)).toBe(false);
    expect(limit(201)).toBe(false);
  });
});

describe("PaymentResponseSchema", () => {
  it("parses a payment", () => {
    expect(PaymentResponseSchema.safeParse(paymentResponse).success).toBe(true);
  });

  it("refuses a status it doesn't know", () => {
    const parsed = PaymentResponseSchema.safeParse({
      ...paymentResponse,
      status: "refunded",
    });

    expect(parsed.success).toBe(false);
  });

  it("refuses a currency other than euros", () => {
    const parsed = PaymentResponseSchema.safeParse({
      ...paymentResponse,
      currency: "USD",
    });

    expect(parsed.success).toBe(false);
  });

  it("still parses an attention reason added after the spec", () => {
    const parsed = PaymentResponseSchema.safeParse({
      ...paymentResponse,
      needsAttention: true,
      attentionReasons: ["chargeback_opened"],
    });

    expect(parsed.success).toBe(true);
  });
});

describe("toPayment", () => {
  it("keeps what the history shows and turns the date into milliseconds", () => {
    const parsed = PaymentResponseSchema.parse(paymentResponse);

    expect(toPayment(parsed)).toEqual({
      id: "pay_b363fa8001a7cbd1",
      orderId: "ord_f494ab66c7ee64d4",
      status: "confirmed",
      amountCents: 410,
      mensaName: "Mensa Nord",
      items: paymentResponse.items,
      refundedAmountCents: 0,
      pendingRefundAmountCents: 0,
      createdAtMs: Date.UTC(2026, 9, 28, 11, 40, 14, 727),
      version: 2,
    });
  });
});

describe("toPaymentPage", () => {
  it("keeps the order of the payments and the cursor", () => {
    const parsed = PaymentPageResponseSchema.parse({
      items: [
        { ...paymentResponse, id: "pay_newer" },
        { ...paymentResponse, id: "pay_older" },
      ],
      nextCursor: "cursor_2",
    });

    const page = toPaymentPage(parsed);

    expect(page.payments.map((listed) => listed.id)).toEqual([
      "pay_newer",
      "pay_older",
    ]);
    expect(page.nextCursor).toBe("cursor_2");
  });

  it("has no cursor on the last page", () => {
    const parsed = PaymentPageResponseSchema.parse({
      items: [],
      nextCursor: null,
    });

    expect(toPaymentPage(parsed)).toEqual({ payments: [], nextCursor: null });
  });
});

describe("newerPayment", () => {
  it("never goes back to a lower version", () => {
    const confirmed = payment(2, "confirmed");

    expect(newerPayment(confirmed, payment(1, "pending"))).toBe(confirmed);
  });

  it("takes a higher version", () => {
    const confirmed = payment(2, "confirmed");

    expect(newerPayment(payment(1, "pending"), confirmed)).toBe(confirmed);
  });

  it("takes the reply when there is nothing yet", () => {
    const pending = payment(1, "pending");

    expect(newerPayment(undefined, pending)).toBe(pending);
  });
});

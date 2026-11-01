import { describe, expect, it } from "vitest";
import {
  CreatePaymentRequestSchema,
  PaymentDetailResponseSchema,
  PaymentListRequestSchema,
  PaymentPageResponseSchema,
  PaymentResponseSchema,
} from "./backend";
import {
  newerPayment,
  toCashierPayment,
  toCashierPaymentPage,
  toPayment,
  toPaymentDetail,
  toPaymentList,
  toPaymentPage,
  type CashierPayment,
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

describe("CreatePaymentRequestSchema", () => {
  it("takes a whole number of cents above 0, as the spec does", () => {
    const amount = (amountCents: number) =>
      CreatePaymentRequestSchema.safeParse({ amountCents }).success;

    expect(amount(1)).toBe(true);
    expect(amount(410)).toBe(true);
    expect(amount(0)).toBe(false);
    expect(amount(-410)).toBe(false);
    expect(amount(4.1)).toBe(false);
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

describe("toCashierPayment", () => {
  it("keeps the payer's fields and adds who paid, the refundable amount and the flag", () => {
    const parsed = PaymentResponseSchema.parse({
      ...paymentResponse,
      refundedAmountCents: 130,
      refundableAmountCents: 280,
      needsAttention: true,
      attentionReasons: ["refund_failed"],
    });

    expect(toCashierPayment(parsed)).toEqual({
      ...toPayment(parsed),
      payerName: "Test Student",
      refundableAmountCents: 280,
      needsAttention: true,
    });
  });
});

describe("toCashierPaymentPage", () => {
  it("keeps the order of the payments and the cursor", () => {
    const parsed = PaymentPageResponseSchema.parse({
      items: [
        { ...paymentResponse, id: "pay_newer" },
        { ...paymentResponse, id: "pay_older" },
      ],
      nextCursor: "cursor_2",
    });

    const page = toCashierPaymentPage(parsed);

    expect(page.payments.map((listed) => listed.id)).toEqual([
      "pay_newer",
      "pay_older",
    ]);
    expect(page.payments[0]?.payerName).toBe("Test Student");
    expect(page.nextCursor).toBe("cursor_2");
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

describe("toPaymentList", () => {
  it("joins the pages in order", () => {
    const newest = { ...payment(1, "confirmed"), id: "pay_3" };
    const middle = { ...payment(1, "confirmed"), id: "pay_2" };
    const oldest = { ...payment(1, "confirmed"), id: "pay_1" };

    const list = toPaymentList([
      { payments: [newest, middle], nextCursor: "cursor_2" },
      { payments: [oldest], nextCursor: null },
    ]);

    expect(list.map((listed) => listed.id)).toEqual([
      "pay_3",
      "pay_2",
      "pay_1",
    ]);
  });

  it("lists a payment on two pages once, where it first came, at its newer version", () => {
    const pendingOnFirstPage = { ...payment(1, "pending"), id: "pay_2" };
    const confirmedOnSecondPage = { ...payment(2, "confirmed"), id: "pay_2" };
    const older = { ...payment(1, "confirmed"), id: "pay_1" };

    const list = toPaymentList([
      { payments: [pendingOnFirstPage], nextCursor: "cursor_2" },
      { payments: [confirmedOnSecondPage, older], nextCursor: null },
    ]);

    expect(list).toEqual([confirmedOnSecondPage, older]);
  });

  it("is empty with no pages", () => {
    expect(toPaymentList([])).toEqual([]);
  });

  it("keeps the till's fields on a cashier's payments", () => {
    const listed: CashierPayment = {
      ...payment(1, "confirmed"),
      payerName: "Test Student",
      refundableAmountCents: 320,
      needsAttention: false,
    };

    expect(toPaymentList([{ payments: [listed], nextCursor: null }])).toEqual([
      listed,
    ]);
  });
});

// A real GET /payments/{paymentId} reply from the dev server: the student's
// payment with half of it refunded.
const refundedDetailResponse = {
  id: "pay_1bd59b3f7d95d269",
  orderId: "ord_398d18d97f6f9b8c",
  status: "confirmed",
  amountCents: 260,
  currency: "EUR",
  priceGroup: "student",
  mensa: { id: "mensa_campus", name: "Mensa am Campus" },
  till: { id: "till_campus_3", name: "Kasse 3" },
  payer: { id: "usr_student", displayName: "Test Student" },
  items: [
    {
      itemId: "item_campus_spritzer",
      name: { de: "Apfelschorle 0,5 l", en: "Apple spritzer 0.5 l" },
      quantity: 1,
      unitPriceCents: 140,
    },
    {
      itemId: "item_campus_soup",
      name: { de: "Suppe des Tages", en: "Soup of the day" },
      quantity: 1,
      unitPriceCents: 120,
    },
  ],
  refundedAmountCents: 130,
  pendingRefundAmountCents: 0,
  refundableAmountCents: 0,
  needsAttention: false,
  attentionReasons: [],
  createdAt: "2026-09-30T09:36:01.910Z",
  updatedAt: "2026-09-30T18:35:07.910Z",
  version: 4,
  refunds: [
    {
      id: "ref_93c872de0a0e405c",
      paymentId: "pay_1bd59b3f7d95d269",
      amountCents: 130,
      currency: "EUR",
      status: "completed",
      reason: "Seed refund",
      createdAt: "2026-09-30T18:35:04.910Z",
      updatedAt: "2026-09-30T18:35:07.910Z",
    },
  ],
  history: [
    {
      at: "2026-09-30T09:36:01.910Z",
      type: "payment_created",
      amountCents: 260,
      refundId: null,
    },
    {
      at: "2026-09-30T09:36:04.910Z",
      type: "payment_confirmed",
      amountCents: 260,
      refundId: null,
    },
    {
      at: "2026-09-30T18:35:04.910Z",
      type: "refund_requested",
      amountCents: 130,
      refundId: "ref_93c872de0a0e405c",
    },
    {
      at: "2026-09-30T18:35:07.910Z",
      type: "refund_completed",
      amountCents: 130,
      refundId: "ref_93c872de0a0e405c",
    },
  ],
};

describe("PaymentDetailResponseSchema", () => {
  it("parses a payment with a refund and its history", () => {
    expect(
      PaymentDetailResponseSchema.safeParse(refundedDetailResponse).success,
    ).toBe(true);
  });

  it("refuses a refund status it doesn't know", () => {
    const [refund] = refundedDetailResponse.refunds;
    const parsed = PaymentDetailResponseSchema.safeParse({
      ...refundedDetailResponse,
      refunds: [{ ...refund, status: "reversed" }],
    });

    expect(parsed.success).toBe(false);
  });

  it("takes a refund without a reason", () => {
    const [refund] = refundedDetailResponse.refunds;
    const parsed = PaymentDetailResponseSchema.safeParse({
      ...refundedDetailResponse,
      refunds: [{ ...refund, reason: null }],
    });

    expect(parsed.success).toBe(true);
  });
});

describe("toPaymentDetail", () => {
  it("keeps the list's fields and adds the till, refunds and history", () => {
    const parsed = PaymentDetailResponseSchema.parse(refundedDetailResponse);

    const detail = toPaymentDetail(parsed);

    expect(detail).toMatchObject({
      id: "pay_1bd59b3f7d95d269",
      status: "confirmed",
      amountCents: 260,
      mensaName: "Mensa am Campus",
      tillName: "Kasse 3",
      refundedAmountCents: 130,
      version: 4,
    });
    expect(detail.refunds).toEqual([
      {
        id: "ref_93c872de0a0e405c",
        amountCents: 130,
        status: "completed",
        reason: "Seed refund",
        createdAtMs: Date.UTC(2026, 8, 30, 18, 35, 4, 910),
      },
    ]);
    expect(detail.history.map((event) => event.type)).toEqual([
      "payment_created",
      "payment_confirmed",
      "refund_requested",
      "refund_completed",
    ]);
    expect(detail.history[0]).toEqual({
      atMs: Date.UTC(2026, 8, 30, 9, 36, 1, 910),
      type: "payment_created",
      amountCents: 260,
    });
  });

  it("names an event the app doesn't know `other` instead of failing", () => {
    const parsed = PaymentDetailResponseSchema.parse({
      ...refundedDetailResponse,
      history: [
        {
          at: "2026-09-30T19:00:00.000Z",
          type: "chargeback_opened",
          amountCents: null,
          refundId: null,
        },
      ],
    });

    expect(toPaymentDetail(parsed).history).toEqual([
      {
        atMs: Date.UTC(2026, 8, 30, 19, 0, 0),
        type: "other",
        amountCents: null,
      },
    ]);
  });
});

describe("newerPayment with details", () => {
  it("keeps the detail with the higher version", () => {
    const parsed = PaymentDetailResponseSchema.parse(refundedDetailResponse);
    const refunded = toPaymentDetail(parsed);
    const beforeTheRefund = { ...refunded, version: 2, refunds: [] };

    expect(newerPayment(refunded, beforeTheRefund)).toBe(refunded);
  });
});

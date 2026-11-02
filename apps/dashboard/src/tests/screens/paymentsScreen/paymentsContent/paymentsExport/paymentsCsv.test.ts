import type { FinancePayment } from "@zahln/domain/payment/frontend";
import { describe, expect, it } from "vitest";
import {
  toPaymentsCsv,
  toPaymentsCsvFileName,
  type PaymentsCsvLabels,
} from "../../../../../screens/paymentsScreen/paymentsContent/paymentsExport/paymentsCsv";

const labels: PaymentsCsvLabels = {
  attentionReasons: {
    pending_too_long: "Pending too long",
    refund_pending_too_long: "Refund pending too long",
    refund_failed: "Refund failed",
    other: "Other reason",
  },
  headers: {
    paymentId: "Payment ID",
    orderId: "Order ID",
    created: "Created (Berlin time)",
    status: "Status",
    amount: "Amount (EUR)",
    refunded: "Refunded (EUR)",
    pendingRefund: "Refund on its way (EUR)",
    priceGroup: "Price group",
    mensa: "Mensa",
    till: "Till",
    payerId: "Payer ID",
    reasons: "Needs attention because",
  },
  priceGroups: { student: "Student", staff: "Staff", guest: "Guest" },
  statuses: {
    pending: "Pending",
    confirmed: "Confirmed",
    declined: "Declined",
  },
};

/** A payment with a refund on its way, as the finance list has it. */
const payment: FinancePayment = {
  id: "pay_b94e0960eac87b8b",
  orderId: "ord_2f0b90d9931fff89",
  status: "confirmed",
  amountCents: 130,
  mensaName: "Cafeteria Bibliothek",
  items: [],
  refundedAmountCents: 0,
  pendingRefundAmountCents: 130,
  // 12:46:05 UTC is 14:46:05 in Berlin in summer.
  createdAtMs: Date.UTC(2026, 9, 10, 12, 46, 5),
  version: 3,
  payerId: "usr_payer_103",
  payerName: "Test Student 103",
  priceGroup: "student",
  mensaId: "cafe_bibliothek",
  tillId: "till_bibliothek_1",
  tillName: "Kasse 1",
  refundableAmountCents: 0,
  needsAttention: true,
  attentionReasons: ["refund_pending_too_long"],
};

describe("toPaymentsCsv", () => {
  it("writes the header and a row per payment, in the agreed columns", () => {
    const csv = toPaymentsCsv([payment], labels, "en");

    expect(csv.split("\r\n")).toEqual([
      "Payment ID,Order ID,Created (Berlin time),Status,Amount (EUR),Refunded (EUR),Refund on its way (EUR),Price group,Mensa,Till,Payer ID,Needs attention because",
      "pay_b94e0960eac87b8b,ord_2f0b90d9931fff89,2026-10-10 14:46:05,Confirmed,1.30,0.00,1.30,Student,Cafeteria Bibliothek,Kasse 1,usr_payer_103,Refund pending too long",
      "",
    ]);
  });

  it("writes German files with semicolons and decimal commas", () => {
    const [, row] = toPaymentsCsv([payment], labels, "de").split("\r\n");

    expect(row).toBe(
      "pay_b94e0960eac87b8b;ord_2f0b90d9931fff89;2026-10-10 14:46:05;Confirmed;1,30;0,00;1,30;Student;Cafeteria Bibliothek;Kasse 1;usr_payer_103;Refund pending too long",
    );
  });

  it("lists each reason once, and none for a payment that needs nothing", () => {
    const csv = toPaymentsCsv(
      [
        {
          ...payment,
          attentionReasons: ["refund_failed", "other", "other"],
        },
        { ...payment, needsAttention: false, attentionReasons: [] },
      ],
      labels,
      "en",
    );
    const [, flaggedRow, calmRow] = csv.split("\r\n");

    expect(flaggedRow?.endsWith(",Refund failed | Other reason")).toBe(true);
    expect(calmRow?.endsWith(",usr_payer_103,")).toBe(true);
  });

  it("keeps a name from the server from running as a formula", () => {
    const [, row] = toPaymentsCsv(
      [{ ...payment, mensaName: "=HYPERLINK(1)" }],
      labels,
      "en",
    ).split("\r\n");

    expect(row).toContain(",'=HYPERLINK(1),");
  });

  it("writes only the header when there are no payments", () => {
    expect(toPaymentsCsv([], labels, "en").split("\r\n")).toHaveLength(2);
  });
});

describe("toPaymentsCsvFileName", () => {
  it("names the file after the day it was saved", () => {
    expect(toPaymentsCsvFileName("2026-11-02")).toBe(
      "zahln-payments-2026-11-02.csv",
    );
  });
});

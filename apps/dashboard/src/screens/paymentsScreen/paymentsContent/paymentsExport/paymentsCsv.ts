import { toCsv, type CsvSeparator } from "@zahln/domain/csv/csv";
import { berlinDateTimeOf, type BerlinDay } from "@zahln/domain/day/berlinDay";
import type {
  AttentionReason,
  FinancePayment,
  PaymentStatus,
} from "@zahln/domain/payment/frontend";
import type { PriceGroup } from "@zahln/domain/user/frontend";
import { formatCentsAsNumber } from "@zahln/i18n/format";
import type { AppLanguage } from "@zahln/i18n/language";

/** The file's columns, in order: the ones agreed with finance. */
export const PAYMENTS_CSV_COLUMNS = [
  "paymentId",
  "orderId",
  "created",
  "status",
  "amount",
  "refunded",
  "pendingRefund",
  "priceGroup",
  "mensa",
  "till",
  "payerId",
  "reasons",
] as const;

export type PaymentsCsvColumn = (typeof PAYMENTS_CSV_COLUMNS)[number];

/**
 * The words the file is written in: its headers, and the names of statuses,
 * price groups and reasons, all in the app language.
 */
export interface PaymentsCsvLabels {
  attentionReasons: Record<AttentionReason, string>;
  headers: Record<PaymentsCsvColumn, string>;
  priceGroups: Record<PriceGroup, string>;
  statuses: Record<PaymentStatus, string>;
}

// A spreadsheet in a language with a decimal comma expects semicolons
// between cells; one in English expects commas. Each gets what it opens
// without an import dialog.
const csvSeparators = {
  en: ",",
  de: ";",
} satisfies Record<AppLanguage, CsvSeparator>;

/** One payment's cells, by column. */
const toCells = (
  payment: FinancePayment,
  labels: PaymentsCsvLabels,
  language: AppLanguage,
): Record<PaymentsCsvColumn, string> => ({
  paymentId: payment.id,
  orderId: payment.orderId,
  created: berlinDateTimeOf(payment.createdAtMs),
  status: labels.statuses[payment.status],
  // Plain numbers in the app language, with no euro sign, so the
  // spreadsheet can add them up. The header says they are euros.
  amount: formatCentsAsNumber(payment.amountCents, language),
  refunded: formatCentsAsNumber(payment.refundedAmountCents, language),
  pendingRefund: formatCentsAsNumber(
    payment.pendingRefundAmountCents,
    language,
  ),
  priceGroup: labels.priceGroups[payment.priceGroup],
  mensa: payment.mensaName,
  till: payment.tillName,
  payerId: payment.payerId,
  // Each reason once, between pipes, which none of their words contain.
  reasons: [...new Set(payment.attentionReasons)]
    .map((reason) => labels.attentionReasons[reason])
    .join(" | "),
});

/**
 * The payments as a CSV file's text: a header row, then a row per payment
 * in the order given, newest first.
 */
export const toPaymentsCsv = (
  payments: FinancePayment[],
  labels: PaymentsCsvLabels,
  language: AppLanguage,
): string => {
  const headerRow = PAYMENTS_CSV_COLUMNS.map(
    (column) => labels.headers[column],
  );
  const paymentRows = payments.map((payment) => {
    const cells = toCells(payment, labels, language);
    return PAYMENTS_CSV_COLUMNS.map((column) => cells[column]);
  });
  return toCsv([headerRow, ...paymentRows], csvSeparators[language]);
};

/**
 * "zahln-payments-2026-11-02.csv", named after the day it was saved, so the
 * files of different days sort and don't take each other's names.
 */
export const toPaymentsCsvFileName = (today: BerlinDay): string =>
  `zahln-payments-${today}.csv`;

import { createColumnHelper } from "@tanstack/react-table";
import type { CashierPayment } from "@zahln/domain/payment/frontend";
import { formatCents, formatDateTime } from "@zahln/i18n/format";
import type { AppLanguage } from "@zahln/i18n/language";
import DateTimeJSX from "@zahln/ui/components/dateTime/DateTimeJSX";
import type { TFunction } from "i18next";
import type { DataTableFeatures } from "../../../../components/dataTable/DataTable";
import StatusBadge from "../../../../components/statusBadge/StatusBadge";

const helper = createColumnHelper<DataTableFeatures, CashierPayment>();

/** "1× Dessert, 2× Soup", in the app language. */
const toItemsSummary = (
  payment: CashierPayment,
  t: TFunction<"till">,
  language: AppLanguage,
): string =>
  payment.items
    .map((item) =>
      t("home.payments.item", {
        quantity: item.quantity,
        name: item.name[language],
      }),
    )
    .join(", ");

/**
 * Money is right-aligned, with digits of equal width, so the decimal points
 * line up down the column, as in the menu's prices.
 */
const amountColumn = (t: TFunction<"till">, language: AppLanguage) =>
  helper.accessor("amountCents", {
    header: () => <div className="text-right">{t("home.payments.amount")}</div>,
    cell: (info) => (
      <div className="text-right tabular-nums">
        {formatCents(info.getValue(), language)}
      </div>
    ),
  });

/**
 * What went back to the payer, and what is still on its way. Empty for most
 * payments, which have no refund at all.
 */
const refundedColumn = (t: TFunction<"till">, language: AppLanguage) =>
  helper.accessor("refundedAmountCents", {
    header: () => (
      <div className="text-right">{t("home.payments.refunded")}</div>
    ),
    cell: ({ row }) => {
      const { pendingRefundAmountCents, refundedAmountCents } = row.original;

      return (
        <div className="flex flex-col items-end tabular-nums">
          {refundedAmountCents > 0 && (
            <span>{formatCents(refundedAmountCents, language)}</span>
          )}
          {pendingRefundAmountCents > 0 && (
            <span className="text-muted-foreground">
              {t("home.payments.refundPending", {
                amount: formatCents(pendingRefundAmountCents, language),
              })}
            </span>
          )}
        </div>
      );
    },
  });

/**
 * The till's payments, newest first: when, which order, how much, what was
 * refunded, the status, who paid and what they ate.
 *
 * What the cashier checks comes first. A table wider than the screen scrolls
 * sideways, as in portrait, and the payer and the dishes are what may go out
 * of view then, never the status.
 */
export const getPaymentColumns = (
  t: TFunction<"till">,
  language: AppLanguage,
) =>
  helper.columns([
    helper.accessor("createdAtMs", {
      header: t("home.payments.time"),
      cell: (info) => (
        <DateTimeJSX
          dateTimeIso={new Date(info.getValue()).toISOString()}
          value={formatDateTime(info.getValue(), language)}
        />
      ),
    }),
    helper.accessor("orderId", {
      header: t("home.payments.orderCode"),
      // Monospace, like the code under the QR, so the two are easy to match.
      cell: (info) => <span className="font-mono">{info.getValue()}</span>,
    }),
    amountColumn(t, language),
    refundedColumn(t, language),
    helper.accessor("status", {
      header: t("home.payments.status"),
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
    // Table cells don't wrap, so a long name or a big order would make the
    // table wider than the screen. These two text columns do, down to a
    // width that stays readable; money, codes and badges never break.
    helper.accessor("payerName", {
      header: t("home.payments.payer"),
      cell: (info) => (
        <div className="min-w-24 whitespace-normal">{info.getValue()}</div>
      ),
    }),
    helper.accessor((payment) => toItemsSummary(payment, t, language), {
      id: "items",
      header: t("home.payments.items"),
      cell: (info) => (
        <div className="min-w-40 whitespace-normal">{info.getValue()}</div>
      ),
    }),
  ]);

/** Rows are keyed by the payment's id, not by their place in the list. */
export const getPaymentRowId = (payment: CashierPayment): string => payment.id;

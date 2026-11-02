import { createColumnHelper } from "@tanstack/react-table";
import type { CashierPayment } from "@zahln/domain/payment/frontend";
import type { AppLanguage } from "@zahln/i18n/language";
import type { TFunction } from "i18next";
import type { DataTableFeatures } from "../../../../components/dataTable/DataTable";
import MoneyCell from "../../../../components/moneyCell/MoneyCell";
import NumberHeader from "../../../../components/numberHeader/NumberHeader";
import StatusBadge from "../../../../components/statusBadge/StatusBadge";
import DateTimeCell from "./paymentCells/dateTimeCell/DateTimeCell";
import ItemsCell from "./paymentCells/itemsCell/ItemsCell";
import OrderCodeCell from "./paymentCells/orderCodeCell/OrderCodeCell";
import PayerCell from "./paymentCells/payerCell/PayerCell";
import RefundedCell from "./paymentCells/refundedCell/RefundedCell";

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
 * The till's payments, newest first: when, which order, how much, what was
 * refunded, the status, who paid and what they ate. Each cell is a component
 * of its own; a column only says which one goes where.
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
      cell: (info) => <DateTimeCell timeMs={info.getValue()} />,
    }),
    helper.accessor("orderId", {
      header: t("home.payments.orderCode"),
      cell: (info) => <OrderCodeCell orderId={info.getValue()} />,
    }),
    helper.accessor("amountCents", {
      header: () => <NumberHeader label={t("home.payments.amount")} />,
      cell: (info) => <MoneyCell amountCents={info.getValue()} />,
    }),
    helper.accessor("refundedAmountCents", {
      header: () => <NumberHeader label={t("home.payments.refunded")} />,
      cell: ({ row }) => (
        <RefundedCell
          pendingRefundAmountCents={row.original.pendingRefundAmountCents}
          refundedAmountCents={row.original.refundedAmountCents}
        />
      ),
    }),
    helper.accessor("status", {
      header: t("home.payments.status"),
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
    helper.accessor("payerName", {
      header: t("home.payments.payer"),
      cell: (info) => <PayerCell payerName={info.getValue()} />,
    }),
    helper.accessor((payment) => toItemsSummary(payment, t, language), {
      id: "items",
      header: t("home.payments.items"),
      cell: (info) => <ItemsCell itemsSummary={info.getValue()} />,
    }),
  ]);

/** Rows are keyed by the payment's id, not by their place in the list. */
export const getPaymentRowId = (payment: CashierPayment): string => payment.id;

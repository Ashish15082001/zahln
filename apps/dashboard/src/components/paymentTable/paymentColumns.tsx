import { createColumnHelper } from "@tanstack/react-table";
import type { FinancePayment } from "@zahln/domain/payment/frontend";
import type { TFunction } from "i18next";
import type { DataTableFeatures } from "../dataTable/DataTable";
import MoneyCell from "../moneyCell/MoneyCell";
import NumberHeader from "../numberHeader/NumberHeader";
import StatusBadge from "../statusBadge/StatusBadge";
import DateTimeCell from "./paymentCells/dateTimeCell/DateTimeCell";
import PayerCell from "./paymentCells/payerCell/PayerCell";
import PaymentIdCell from "./paymentCells/paymentIdCell/PaymentIdCell";
import PlaceCell from "./paymentCells/placeCell/PlaceCell";
import RefundedCell from "./paymentCells/refundedCell/RefundedCell";

const helper = createColumnHelper<DataTableFeatures, FinancePayment>();

/**
 * Every mensa's payments: when, the status, how much, what was refunded,
 * where, who paid and the ids. Each cell is a component of its own; a column
 * only says which one goes where.
 *
 * What finance checks first comes first. A table wider than the screen
 * scrolls sideways, and the ids are what may go out of view then, never the
 * status or the amounts.
 */
export const getPaymentColumns = (t: TFunction<"dashboard">) =>
  helper.columns([
    helper.accessor("createdAtMs", {
      header: t("payments.table.created"),
      cell: (info) => <DateTimeCell timeMs={info.getValue()} />,
    }),
    helper.accessor("status", {
      header: t("payments.table.status"),
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
    helper.accessor("amountCents", {
      header: () => <NumberHeader label={t("payments.table.amount")} />,
      cell: (info) => <MoneyCell amountCents={info.getValue()} />,
    }),
    helper.accessor("refundedAmountCents", {
      header: () => <NumberHeader label={t("payments.table.refunded")} />,
      cell: ({ row }) => (
        <RefundedCell
          pendingRefundAmountCents={row.original.pendingRefundAmountCents}
          refundedAmountCents={row.original.refundedAmountCents}
        />
      ),
    }),
    helper.accessor("mensaName", {
      header: t("payments.table.place"),
      cell: ({ row }) => (
        <PlaceCell
          mensaName={row.original.mensaName}
          tillName={row.original.tillName}
        />
      ),
    }),
    helper.accessor("payerName", {
      header: t("payments.table.payer"),
      cell: ({ row }) => (
        <PayerCell
          payerId={row.original.payerId}
          payerName={row.original.payerName}
        />
      ),
    }),
    helper.accessor("id", {
      header: t("payments.table.payment"),
      cell: ({ row }) => (
        <PaymentIdCell
          orderId={row.original.orderId}
          paymentId={row.original.id}
        />
      ),
    }),
  ]);

/** Rows are keyed by the payment's id, not by their place in the list. */
export const getPaymentRowId = (payment: FinancePayment): string => payment.id;

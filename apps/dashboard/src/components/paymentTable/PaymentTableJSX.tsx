import type { FinancePayment } from "@zahln/domain/payment/frontend";
import type { FC } from "react";
import DataTable from "../dataTable/DataTable";
import { getPaymentColumns, getPaymentRowId } from "./paymentColumns";

export interface PaymentTableJSXProps {
  columns: ReturnType<typeof getPaymentColumns>;
  emptyText: string;
  payments: FinancePayment[];
}

/**
 * Every mensa's payments as a table, for the payment search and the payments
 * that need attention alike.
 */
const PaymentTableJSX: FC<PaymentTableJSXProps> = ({
  columns,
  emptyText,
  payments,
}) => (
  <DataTable
    columns={columns}
    data={payments}
    emptyText={emptyText}
    getRowId={getPaymentRowId}
  />
);

export default PaymentTableJSX;

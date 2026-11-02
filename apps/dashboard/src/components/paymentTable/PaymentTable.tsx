import type { FinancePayment } from "@zahln/domain/payment/frontend";
import { useMemo, type FC } from "react";
import { useTranslation } from "react-i18next";
import { getPaymentColumns } from "./paymentColumns";
import PaymentTableJSX from "./PaymentTableJSX";

export interface PaymentTableProps {
  // A column with why each payment needs attention, after its status.
  isReasonsShown: boolean;
  payments: FinancePayment[];
}

const PaymentTable: FC<PaymentTableProps> = ({ isReasonsShown, payments }) => {
  const { t } = useTranslation("dashboard");
  // The table needs the same columns from one render to the next. They only
  // change with the language: t is a new function when it changes, and each
  // cell writes its dates and amounts in it.
  const columns = useMemo(
    () => getPaymentColumns(t, isReasonsShown),
    [t, isReasonsShown],
  );

  return (
    <PaymentTableJSX
      columns={columns}
      emptyText={t("paymentList.empty.noMatch.title")}
      payments={payments}
    />
  );
};

export default PaymentTable;

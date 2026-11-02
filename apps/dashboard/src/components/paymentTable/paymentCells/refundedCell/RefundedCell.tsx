import { formatCents } from "@zahln/i18n/format";
import { pickLanguage } from "@zahln/i18n/language";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import RefundedCellJSX from "./RefundedCellJSX";

export interface RefundedCellProps {
  pendingRefundAmountCents: number;
  refundedAmountCents: number;
}

const RefundedCell: FC<RefundedCellProps> = ({
  pendingRefundAmountCents,
  refundedAmountCents,
}) => {
  const { t, i18n } = useTranslation("dashboard");
  // i18next only resolves to a supported language. pickLanguage narrows the
  // type to AppLanguage, with English if that ever changes.
  const language = pickLanguage([i18n.resolvedLanguage ?? ""]);

  const refundedAmount =
    refundedAmountCents > 0 ? formatCents(refundedAmountCents, language) : null;
  const pendingRefund =
    pendingRefundAmountCents > 0
      ? t("payments.table.refundPending", {
          amount: formatCents(pendingRefundAmountCents, language),
        })
      : null;

  return (
    <RefundedCellJSX
      pendingRefund={pendingRefund}
      refundedAmount={refundedAmount}
    />
  );
};

export default RefundedCell;

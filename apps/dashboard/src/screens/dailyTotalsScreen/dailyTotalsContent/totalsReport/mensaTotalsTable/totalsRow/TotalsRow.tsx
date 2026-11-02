import type { Totals } from "@zahln/domain/dailyTotals/frontend";
import { formatCents, formatCount } from "@zahln/i18n/format";
import { pickLanguage } from "@zahln/i18n/language";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import TotalsRowJSX from "./TotalsRowJSX";

export interface TotalsRowProps {
  // The mensa's own row, which heads its tills' rows.
  isMensaRow: boolean;
  label: string;
  totals: Totals;
}

const TotalsRow: FC<TotalsRowProps> = ({ isMensaRow, label, totals }) => {
  const { i18n } = useTranslation("dashboard");
  const language = pickLanguage([i18n.resolvedLanguage ?? ""]);

  return (
    <TotalsRowJSX
      gross={formatCents(totals.grossCents, language)}
      isMensaRow={isMensaRow}
      label={label}
      net={formatCents(totals.netCents, language)}
      paymentCount={formatCount(totals.paymentCount, language)}
      pending={formatCents(totals.pendingCents, language)}
      refunded={formatCents(totals.refundedCents, language)}
    />
  );
};

export default TotalsRow;

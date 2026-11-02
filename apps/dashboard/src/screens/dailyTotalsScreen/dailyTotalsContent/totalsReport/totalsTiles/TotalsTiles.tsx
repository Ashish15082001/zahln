import type { Totals } from "@zahln/domain/dailyTotals/frontend";
import { formatCents, formatCount } from "@zahln/i18n/format";
import { pickLanguage } from "@zahln/i18n/language";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import TotalsTilesJSX, { type TotalsTileOption } from "./TotalsTilesJSX";

export interface TotalsTilesProps {
  totals: Totals;
}

const TotalsTiles: FC<TotalsTilesProps> = ({ totals }) => {
  const { t, i18n } = useTranslation("dashboard");
  const language = pickLanguage([i18n.resolvedLanguage ?? ""]);

  // Gross, refunded and net first, in the order net is worked out. Pending is
  // last and says it isn't in gross: it isn't money yet.
  const tileOptions: TotalsTileOption[] = [
    {
      id: "gross",
      label: t("dailyTotals.tiles.gross"),
      note: t("dailyTotals.tiles.grossNote"),
      value: formatCents(totals.grossCents, language),
    },
    {
      id: "refunded",
      label: t("dailyTotals.tiles.refunded"),
      note: t("dailyTotals.tiles.refundedNote"),
      value: formatCents(totals.refundedCents, language),
    },
    {
      id: "net",
      label: t("dailyTotals.tiles.net"),
      note: t("dailyTotals.tiles.netNote"),
      value: formatCents(totals.netCents, language),
    },
    {
      id: "payments",
      label: t("dailyTotals.tiles.payments"),
      note: t("dailyTotals.tiles.paymentsNote"),
      value: formatCount(totals.paymentCount, language),
    },
    {
      id: "pending",
      label: t("dailyTotals.tiles.pending"),
      note: t("dailyTotals.tiles.pendingNote", {
        count: formatCount(totals.pendingCount, language),
      }),
      value: formatCents(totals.pendingCents, language),
    },
  ];

  return <TotalsTilesJSX tileOptions={tileOptions} />;
};

export default TotalsTiles;

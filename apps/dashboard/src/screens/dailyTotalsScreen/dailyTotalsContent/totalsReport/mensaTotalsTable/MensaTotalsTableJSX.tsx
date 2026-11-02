import type { MensaTotals } from "@zahln/domain/dailyTotals/frontend";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
} from "@zahln/ui/components/table";
import { useId, type FC } from "react";
import { useTranslation } from "react-i18next";
import MensaTotalsGroup from "./mensaTotalsGroup/MensaTotalsGroup";

export interface MensaTotalsTableJSXProps {
  mensas: MensaTotals[];
}

// Right-aligned, so the digits of every row line up.
const NUMBER_HEAD_CLASS_NAME = "text-right";

/**
 * Each mensa's totals, then each of its tills'. A table, not a chart: finance
 * reads exact amounts here, and there are only a few rows. On a phone it
 * scrolls sideways inside its box, not the page.
 */
const MensaTotalsTableJSX: FC<MensaTotalsTableJSXProps> = ({ mensas }) => {
  const { t } = useTranslation("dashboard");
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold" id={headingId}>
        {t("dailyTotals.table.title")}
      </h2>
      <Table aria-labelledby={headingId}>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">{t("dailyTotals.table.name")}</TableHead>
            <TableHead className={NUMBER_HEAD_CLASS_NAME} scope="col">
              {t("dailyTotals.table.payments")}
            </TableHead>
            <TableHead className={NUMBER_HEAD_CLASS_NAME} scope="col">
              {t("dailyTotals.table.gross")}
            </TableHead>
            <TableHead className={NUMBER_HEAD_CLASS_NAME} scope="col">
              {t("dailyTotals.table.refunded")}
            </TableHead>
            <TableHead className={NUMBER_HEAD_CLASS_NAME} scope="col">
              {t("dailyTotals.table.net")}
            </TableHead>
            <TableHead className={NUMBER_HEAD_CLASS_NAME} scope="col">
              {t("dailyTotals.table.pending")}
            </TableHead>
          </TableRow>
        </TableHeader>
        {mensas.map((mensaTotals) => (
          <MensaTotalsGroup
            key={mensaTotals.mensaId}
            mensaTotals={mensaTotals}
          />
        ))}
      </Table>
    </section>
  );
};

export default MensaTotalsTableJSX;

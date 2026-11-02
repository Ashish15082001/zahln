import type { MensaTotals } from "@zahln/domain/dailyTotals/frontend";
import { TableBody } from "@zahln/ui/components/table";
import type { FC } from "react";
import TotalsRow from "../totalsRow/TotalsRow";

export interface MensaTotalsGroupJSXProps {
  mensaTotals: MensaTotals;
}

/**
 * One mensa: its own row, then a row per till. A <tbody> of its own, so its
 * row heads the group (scope="rowgroup") and a screen reader can say which
 * mensa a till belongs to. Goes straight inside the <table>.
 */
const MensaTotalsGroupJSX: FC<MensaTotalsGroupJSXProps> = ({ mensaTotals }) => (
  <TableBody className="border-b last:border-b-0">
    <TotalsRow isMensaRow label={mensaTotals.mensaName} totals={mensaTotals} />
    {mensaTotals.tills.map((tillTotals) => (
      <TotalsRow
        key={tillTotals.tillId}
        isMensaRow={false}
        label={tillTotals.tillName}
        totals={tillTotals}
      />
    ))}
  </TableBody>
);

export default MensaTotalsGroupJSX;

import { TableCell, TableHead, TableRow } from "@zahln/ui/components/table";
import type { FC } from "react";

export interface TotalsRowJSXProps {
  gross: string;
  isMensaRow: boolean;
  label: string;
  net: string;
  paymentCount: string;
  pending: string;
  refunded: string;
}

// Right-aligned with digits of one width, so the amounts of every row line
// up.
const NUMBER_CELL_CLASS_NAME = "text-right tabular-nums";

/**
 * One mensa's or till's totals as a table row. The name is a row header, so
 * a screen reader says whose amount a cell is. A till's name is indented
 * under its mensa's, which is set apart.
 */
const TotalsRowJSX: FC<TotalsRowJSXProps> = ({
  gross,
  isMensaRow,
  label,
  net,
  paymentCount,
  pending,
  refunded,
}) => (
  <TableRow className={isMensaRow ? "bg-muted/50 font-medium" : undefined}>
    <TableHead
      className={isMensaRow ? undefined : "pl-8 font-normal"}
      scope={isMensaRow ? "rowgroup" : "row"}
    >
      {label}
    </TableHead>
    <TableCell className={NUMBER_CELL_CLASS_NAME}>{paymentCount}</TableCell>
    <TableCell className={NUMBER_CELL_CLASS_NAME}>{gross}</TableCell>
    <TableCell className={NUMBER_CELL_CLASS_NAME}>{refunded}</TableCell>
    <TableCell className={NUMBER_CELL_CLASS_NAME}>{net}</TableCell>
    <TableCell className={NUMBER_CELL_CLASS_NAME}>{pending}</TableCell>
  </TableRow>
);

export default TotalsRowJSX;

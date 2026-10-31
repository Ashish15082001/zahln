import type { ReactTable, RowData } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@zahln/ui/components/table";
import type { DataTableFeatures } from "./DataTable";

export interface DataTableJSXProps<TData extends RowData> {
  emptyText: string;
  table: ReactTable<DataTableFeatures, TData>;
}

const DataTableJSX = <TData extends RowData>({
  emptyText,
  table,
}: DataTableJSXProps<TData>) => {
  const rows = table.getRowModel().rows;
  const hasRows = rows.length > 0;
  const columnCount = table.getAllLeafColumns().length;

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder ? null : (
                  <table.FlexRender header={header} />
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {hasRows ? (
          rows.map((row) => (
            <TableRow key={row.id}>
              {row.getAllCells().map((cell) => (
                <TableCell key={cell.id}>
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          // One row across every column, so the table still reads as a
          // table, with its headers, when there is nothing in it.
          <TableRow>
            <TableCell className="h-24 text-center" colSpan={columnCount}>
              {emptyText}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default DataTableJSX;

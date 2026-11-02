import {
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowData,
} from "@tanstack/react-table";
import DataTableJSX from "./DataTableJSX";

/**
 * No features: the dashboard's tables only show rows. Sorting, filtering and
 * paging happen on the server, and row selection, as in the till, is added
 * here when a table needs it.
 */
export const dataTableFeatures = tableFeatures({});

export type DataTableFeatures = typeof dataTableFeatures;

export interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[];
  data: TData[];
  emptyText: string;
  /** The row's id from the data, so a row keeps its key when others change. */
  getRowId: (item: TData) => string;
}

/**
 * shadcn's Data Table: TanStack Table works out the rows and cells, and the
 * shadcn Table draws them. The till's, without its row selection.
 *
 * Callers owe it stable inputs: `columns`, `data` and `getRowId` must be the
 * same objects from one render to the next (module scope, useMemo or query
 * data). A new array each render makes the table rebuild every row.
 */
// Generic, so it can't be typed as FC<...>: an FC fixes TData to one type.
const DataTable = <TData extends RowData>({
  columns,
  data,
  emptyText,
  getRowId,
}: DataTableProps<TData>) => {
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowId,
  });

  return <DataTableJSX emptyText={emptyText} table={table} />;
};

export default DataTable;

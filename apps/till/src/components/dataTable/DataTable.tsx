import {
  rowSelectionFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type OnChangeFn,
  type RowData,
  type RowSelectionState,
} from "@tanstack/react-table";
import DataTableJSX from "./DataTableJSX";

/**
 * Row selection only, for the tables that tick rows. Sorting, filtering and
 * paging are TanStack Table features too, added here when a table needs them.
 */
export const dataTableFeatures = tableFeatures({ rowSelectionFeature });

export type DataTableFeatures = typeof dataTableFeatures;

export interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[];
  data: TData[];
  emptyText: string;
  /**
   * Selected row ids. The owner keeps them, since it acts on them. Left out,
   * with the handler, for a table nobody picks rows in.
   */
  rowSelection?: RowSelectionState;
  /** The row's id from the data, so a row keeps its key when others change. */
  getRowId: (item: TData) => string;
  handleRowSelectionChange?: OnChangeFn<RowSelectionState>;
}

// One object for every read-only table: a new {} each render would be a new
// state for the table to compare.
const NO_ROW_SELECTION: RowSelectionState = {};

/**
 * shadcn's Data Table: TanStack Table works out the rows and cells, and the
 * shadcn Table draws them.
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
  rowSelection = NO_ROW_SELECTION,
  getRowId,
  handleRowSelectionChange,
}: DataTableProps<TData>) => {
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowId,
    state: { rowSelection },
    onRowSelectionChange: handleRowSelectionChange,
  });

  return <DataTableJSX emptyText={emptyText} table={table} />;
};

export default DataTable;

import { createColumnHelper } from "@tanstack/react-table";
import type { AppLanguage } from "@zahln/i18n/language";
import type { TFunction } from "i18next";
import type { DataTableFeatures } from "../../../../components/dataTable/DataTable";
import MoneyCell from "../../../../components/moneyCell/MoneyCell";
import NumberHeader from "../../../../components/numberHeader/NumberHeader";
import type { MenuRow } from "./cart";
import DishCheckbox from "./menuCells/dishCheckbox/DishCheckbox";
import QuantityCell from "./menuCells/quantityCell/QuantityCell";
import QuantityHeader from "./menuCells/quantityHeader/QuantityHeader";
import SelectAllCheckbox from "./menuCells/selectAllCheckbox/SelectAllCheckbox";

const helper = createColumnHelper<DataTableFeatures, MenuRow>();

type PriceGroup = keyof MenuRow["prices"];

// Each cell is a component of its own; a column only says which one goes
// where, and hands it plain values rather than the table's own objects.

/** Tick boxes for picking the order's dishes, each named after its dish. */
const selectColumn = helper.display({
  id: "select",
  header: ({ table }) => (
    <SelectAllCheckbox
      areAllSelected={table.getIsAllRowsSelected()}
      areSomeSelected={table.getIsSomeRowsSelected()}
      handleSelectAllChange={(isSelected) =>
        table.toggleAllRowsSelected(isSelected)
      }
    />
  ),
  cell: ({ row }) => (
    <DishCheckbox
      isSelected={row.getIsSelected()}
      menuRow={row.original}
      handleSelectedChange={(isSelected) => row.toggleSelected(isSelected)}
    />
  ),
});

/** One price group's column. */
const priceColumn = (group: PriceGroup, header: string) =>
  helper.accessor((item) => item.prices[group], {
    id: group,
    header: () => <NumberHeader label={header} />,
    cell: (info) => <MoneyCell amountCents={info.getValue()} />,
  });

/** − and + for a ticked dish. */
const quantityColumn = (
  handleChangeQuantity: (id: string, by: number) => void,
) =>
  helper.accessor("quantity", {
    header: () => <QuantityHeader />,
    cell: ({ row }) => (
      <QuantityCell
        menuRow={row.original}
        handleChangeQuantity={handleChangeQuantity}
      />
    ),
  });

/**
 * The menu's columns: a tick box, the dish in the app language, each group's
 * price, then the quantity. `handleChangeQuantity` must keep its identity
 * between renders, or the columns are rebuilt on every tap.
 */
export const getMenuColumns = (
  t: TFunction<"till">,
  language: AppLanguage,
  handleChangeQuantity: (id: string, by: number) => void,
) =>
  helper.columns([
    selectColumn,
    helper.accessor((item) => item.name[language], {
      id: "dish",
      header: t("home.mensa.dish"),
    }),
    priceColumn("student", t("home.mensa.student")),
    priceColumn("staff", t("home.mensa.staff")),
    priceColumn("guest", t("home.mensa.guest")),
    quantityColumn(handleChangeQuantity),
  ]);

/** Rows are keyed by the dish's id, not by their position in the menu. */
export const getMenuRowId = (row: MenuRow): string => row.id;

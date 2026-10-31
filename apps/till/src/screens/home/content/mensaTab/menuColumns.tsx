import { createColumnHelper, type Table } from "@tanstack/react-table";
import type { MenuItem } from "@zahln/domain/mensa/frontend";
import type { AppLanguage } from "@zahln/i18n/language";
import { Checkbox } from "@zahln/ui/components/checkbox";
import type { TFunction } from "i18next";
import type { DataTableFeatures } from "../../../../components/dataTable/DataTable";
import { formatCents } from "../../../../format/money";

const helper = createColumnHelper<DataTableFeatures, MenuItem>();

type PriceGroup = keyof MenuItem["prices"];

/** The select-all box: ticked, a dash when only some dishes are, or empty. */
const selectAllState = (
  table: Table<DataTableFeatures, MenuItem>,
): boolean | "indeterminate" => {
  if (table.getIsAllRowsSelected()) return true;
  return table.getIsSomeRowsSelected() ? "indeterminate" : false;
};

/**
 * Tick boxes for picking the order's dishes. Each one is named after its dish:
 * a screen reader going down the column hears "Select Currywurst", not ten
 * identical "Select row" boxes.
 */
const selectColumn = (t: TFunction<"till">, language: AppLanguage) =>
  helper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label={t("home.mensa.selectAll")}
        checked={selectAllState(table)}
        // Tapping the dash gives true, so it selects every dish.
        onCheckedChange={(checked) =>
          table.toggleAllRowsSelected(checked === true)
        }
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={t("home.mensa.selectDish", {
          dish: row.original.name[language],
        })}
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(checked === true)}
      />
    ),
  });

/**
 * One price group's column. Right-aligned, with digits of equal width, so the
 * decimal points line up down the column.
 */
const priceColumn = (
  group: PriceGroup,
  header: string,
  language: AppLanguage,
) =>
  helper.accessor((item) => item.prices[group], {
    id: group,
    header: () => <div className="text-right">{header}</div>,
    cell: (info) => (
      <div className="text-right tabular-nums">
        {formatCents(info.getValue(), language)}
      </div>
    ),
  });

/**
 * The menu's columns: a tick box, the dish in the app language, then each
 * group's price.
 */
export const getMenuColumns = (t: TFunction<"till">, language: AppLanguage) =>
  helper.columns([
    selectColumn(t, language),
    helper.accessor((item) => item.name[language], {
      id: "dish",
      header: t("home.mensa.dish"),
    }),
    priceColumn("student", t("home.mensa.student"), language),
    priceColumn("staff", t("home.mensa.staff"), language),
    priceColumn("guest", t("home.mensa.guest"), language),
  ]);

/** Rows are keyed by the dish's id, not by their position in the menu. */
export const getMenuItemId = (item: MenuItem): string => item.id;

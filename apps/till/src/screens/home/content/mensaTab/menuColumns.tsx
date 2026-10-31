import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createColumnHelper, type Table } from "@tanstack/react-table";
import type { AppLanguage } from "@zahln/i18n/language";
import { Button } from "@zahln/ui/components/button";
import { Checkbox } from "@zahln/ui/components/checkbox";
import type { TFunction } from "i18next";
import type { DataTableFeatures } from "../../../../components/dataTable/DataTable";
import { formatCents } from "../../../../format/money";
import { MAX_QUANTITY, MIN_QUANTITY, type MenuRow } from "./cart";

const helper = createColumnHelper<DataTableFeatures, MenuRow>();

type PriceGroup = keyof MenuRow["prices"];

/** The select-all box: ticked, a dash when only some dishes are, or empty. */
const selectAllState = (
  table: Table<DataTableFeatures, MenuRow>,
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
 * − and + for a ticked dish. The buttons name the dish, like the tick boxes,
 * and step from the cart's current quantity, so two quick taps add two.
 */
const quantityColumn = (
  t: TFunction<"till">,
  language: AppLanguage,
  handleChangeQuantity: (id: string, by: number) => void,
) =>
  helper.accessor("quantity", {
    // The header holds the column's width, so the table doesn't shift when
    // the first dish is ticked and its buttons appear.
    header: () => (
      <div className="w-36 text-right">{t("home.mensa.quantity")}</div>
    ),
    cell: ({ row }) => {
      const { id, quantity } = row.original;
      // Unticked dishes get no buttons, so Tab doesn't stop on dead ones.
      if (quantity === null) return null;

      const dish = row.original.name[language];

      return (
        // -my-3 takes back the cell's padding, so a ticked row stays 48 px
        // tall rather than growing to fit the 48 px buttons.
        <div className="-my-3 flex items-center justify-end gap-2">
          <Button
            aria-label={t("home.mensa.oneFewer", { dish })}
            disabled={quantity <= MIN_QUANTITY}
            size="icon"
            variant="outline"
            onClick={() => handleChangeQuantity(id, -1)}
          >
            <HugeiconsIcon aria-hidden icon={MinusSignIcon} />
          </Button>
          {/* An output is a live region, so TalkBack reads the new number
              after each tap. */}
          <output className="w-8 text-center tabular-nums">{quantity}</output>
          <Button
            aria-label={t("home.mensa.oneMore", { dish })}
            disabled={quantity >= MAX_QUANTITY}
            size="icon"
            variant="outline"
            onClick={() => handleChangeQuantity(id, 1)}
          >
            <HugeiconsIcon aria-hidden icon={PlusSignIcon} />
          </Button>
        </div>
      );
    },
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
    selectColumn(t, language),
    helper.accessor((item) => item.name[language], {
      id: "dish",
      header: t("home.mensa.dish"),
    }),
    priceColumn("student", t("home.mensa.student"), language),
    priceColumn("staff", t("home.mensa.staff"), language),
    priceColumn("guest", t("home.mensa.guest"), language),
    quantityColumn(t, language, handleChangeQuantity),
  ]);

/** Rows are keyed by the dish's id, not by their position in the menu. */
export const getMenuRowId = (row: MenuRow): string => row.id;

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@zahln/ui/components/table";
import { useId, type FC } from "react";
import { useTranslation } from "react-i18next";

/** One dish on the payment, written out in the app language. */
export interface ItemLine {
  itemId: string;
  lineTotal: string;
  name: string;
  quantity: string;
  unitPrice: string;
}

export interface ItemListJSXProps {
  itemLines: ItemLine[];
  total: string;
}

// Right-aligned with digits of one width, so the amounts line up.
const NUMBER_CLASS_NAME = "text-right tabular-nums";

/** What was paid for: each dish, how many, at what price, and the total. */
const ItemListJSX: FC<ItemListJSXProps> = ({ itemLines, total }) => {
  const { t } = useTranslation("dashboard");
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold" id={headingId}>
        {t("paymentDetail.items.title")}
      </h2>
      <Table aria-labelledby={headingId}>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">{t("paymentDetail.items.dish")}</TableHead>
            <TableHead className="text-right" scope="col">
              {t("paymentDetail.items.quantity")}
            </TableHead>
            <TableHead className="text-right" scope="col">
              {t("paymentDetail.items.unitPrice")}
            </TableHead>
            <TableHead className="text-right" scope="col">
              {t("paymentDetail.items.lineTotal")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {itemLines.map((itemLine) => (
            <TableRow key={itemLine.itemId}>
              {/* Wraps, so a long dish name doesn't widen the table. */}
              <TableHead className="font-normal whitespace-normal" scope="row">
                {itemLine.name}
              </TableHead>
              <TableCell className={NUMBER_CLASS_NAME}>
                {itemLine.quantity}
              </TableCell>
              <TableCell className={NUMBER_CLASS_NAME}>
                {itemLine.unitPrice}
              </TableCell>
              <TableCell className={NUMBER_CLASS_NAME}>
                {itemLine.lineTotal}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableHead colSpan={3} scope="row">
              {t("paymentDetail.items.total")}
            </TableHead>
            <TableCell className={NUMBER_CLASS_NAME}>{total}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </section>
  );
};

export default ItemListJSX;

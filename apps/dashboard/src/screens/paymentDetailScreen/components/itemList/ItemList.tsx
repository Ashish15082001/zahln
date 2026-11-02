import type { PaymentItem } from "@zahln/domain/payment/frontend";
import { formatCents, formatCount } from "@zahln/i18n/format";
import { pickLanguage } from "@zahln/i18n/language";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import ItemListJSX, { type ItemLine } from "./ItemListJSX";

export interface ItemListProps {
  // The payment's amount: what the payer was charged, shown as the total.
  amountCents: number;
  items: PaymentItem[];
}

const ItemList: FC<ItemListProps> = ({ amountCents, items }) => {
  const { i18n } = useTranslation("dashboard");
  // i18next only resolves to a supported language. pickLanguage narrows the
  // type to AppLanguage, with English if that ever changes.
  const language = pickLanguage([i18n.resolvedLanguage ?? ""]);

  const itemLines: ItemLine[] = items.map((item) => ({
    itemId: item.itemId,
    lineTotal: formatCents(item.unitPriceCents * item.quantity, language),
    // The server names each dish in both languages.
    name: item.name[language],
    quantity: formatCount(item.quantity, language),
    unitPrice: formatCents(item.unitPriceCents, language),
  }));

  return (
    <ItemListJSX
      itemLines={itemLines}
      total={formatCents(amountCents, language)}
    />
  );
};

export default ItemList;

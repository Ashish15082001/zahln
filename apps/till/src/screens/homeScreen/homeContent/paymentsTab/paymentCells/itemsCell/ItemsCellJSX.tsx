import type { FC } from "react";

export interface ItemsCellJSXProps {
  // "1× Dessert, 2× Soup", in the app language.
  itemsSummary: string;
}

// Table cells don't wrap, so a big order would make the table wider than the
// screen. This one does, down to a width that stays readable.
const ItemsCellJSX: FC<ItemsCellJSXProps> = ({ itemsSummary }) => (
  <div className="min-w-40 whitespace-normal">{itemsSummary}</div>
);

export default ItemsCellJSX;

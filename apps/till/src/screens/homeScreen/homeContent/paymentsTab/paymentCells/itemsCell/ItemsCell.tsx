import type { FC } from "react";
import ItemsCellJSX, { type ItemsCellJSXProps } from "./ItemsCellJSX";

export type ItemsCellProps = ItemsCellJSXProps;

// Nothing to work out: it shows what it is handed, so the props pass
// straight through to the markup.
const ItemsCell: FC<ItemsCellProps> = (props) => <ItemsCellJSX {...props} />;

export default ItemsCell;

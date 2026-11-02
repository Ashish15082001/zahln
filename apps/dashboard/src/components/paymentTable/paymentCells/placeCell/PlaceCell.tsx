import type { FC } from "react";
import PlaceCellJSX, { type PlaceCellJSXProps } from "./PlaceCellJSX";

export type PlaceCellProps = PlaceCellJSXProps;

// Nothing to work out: it shows what it is handed, so the props pass
// straight through to the markup.
const PlaceCell: FC<PlaceCellProps> = (props) => <PlaceCellJSX {...props} />;

export default PlaceCell;

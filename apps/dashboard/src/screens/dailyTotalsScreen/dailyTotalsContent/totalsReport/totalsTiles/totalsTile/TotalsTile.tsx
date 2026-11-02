import type { FC } from "react";
import TotalsTileJSX, { type TotalsTileJSXProps } from "./TotalsTileJSX";

export type TotalsTileProps = TotalsTileJSXProps;

// Nothing to work out: TotalsTiles hands over the words ready to show.
const TotalsTile: FC<TotalsTileProps> = (props) => <TotalsTileJSX {...props} />;

export default TotalsTile;

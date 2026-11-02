import type { FC } from "react";

export interface PlaceCellJSXProps {
  mensaName: string;
  tillName: string;
}

// The mensa, then its till below it: tills have names like "Kasse 1" that
// every mensa uses, so the till alone wouldn't say where.
const PlaceCellJSX: FC<PlaceCellJSXProps> = ({ mensaName, tillName }) => (
  <div className="flex flex-col">
    <span>{mensaName}</span>
    <span className="text-muted-foreground">{tillName}</span>
  </div>
);

export default PlaceCellJSX;

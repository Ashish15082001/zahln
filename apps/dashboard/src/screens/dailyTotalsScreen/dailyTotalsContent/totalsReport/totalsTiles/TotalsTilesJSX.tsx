import type { FC } from "react";
import TotalsTile from "./totalsTile/TotalsTile";

/** One headline number, with its words ready to show. */
export interface TotalsTileOption {
  id: string;
  label: string;
  // What the number counts, in a few words.
  note: string;
  value: string;
}

export interface TotalsTilesJSXProps {
  tileOptions: TotalsTileOption[];
}

// A description list, so a screen reader reads each number with its label
// rather than five numbers in a row.
const TotalsTilesJSX: FC<TotalsTilesJSXProps> = ({ tileOptions }) => (
  <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
    {tileOptions.map((option) => (
      <TotalsTile
        key={option.id}
        label={option.label}
        note={option.note}
        value={option.value}
      />
    ))}
  </dl>
);

export default TotalsTilesJSX;

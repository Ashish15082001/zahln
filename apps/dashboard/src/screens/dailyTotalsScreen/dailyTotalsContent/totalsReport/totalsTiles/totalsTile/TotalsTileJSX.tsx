import { Card } from "@zahln/ui/components/card";
import type { FC } from "react";

export interface TotalsTileJSXProps {
  label: string;
  note: string;
  value: string;
}

/**
 * One headline number as a card: the label, the number, then what it
 * counts. Goes straight inside a <dl>; the card is the <div> a <dl> may
 * group each term and its descriptions in.
 */
const TotalsTileJSX: FC<TotalsTileJSXProps> = ({ label, note, value }) => (
  <Card className="gap-1 px-4" size="sm">
    <dt className="text-sm text-muted-foreground">{label}</dt>
    {/* Proportional figures: tabular ones are for numbers lined up in a
        column, and look loose this large. */}
    <dd className="text-2xl font-semibold">{value}</dd>
    <dd className="text-xs text-muted-foreground">{note}</dd>
  </Card>
);

export default TotalsTileJSX;

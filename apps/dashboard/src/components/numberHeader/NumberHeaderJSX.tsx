import type { FC } from "react";

export interface NumberHeaderJSXProps {
  label: string;
}

/** A number column's header, right-aligned like the numbers under it. */
const NumberHeaderJSX: FC<NumberHeaderJSXProps> = ({ label }) => (
  <div className="text-right">{label}</div>
);

export default NumberHeaderJSX;

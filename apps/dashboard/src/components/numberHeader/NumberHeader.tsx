import type { FC } from "react";
import NumberHeaderJSX, { type NumberHeaderJSXProps } from "./NumberHeaderJSX";

export type NumberHeaderProps = NumberHeaderJSXProps;

// Nothing to work out: it shows what it is handed, so the props pass
// straight through to the markup.
const NumberHeader: FC<NumberHeaderProps> = (props) => (
  <NumberHeaderJSX {...props} />
);

export default NumberHeader;

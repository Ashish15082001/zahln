import type { FC } from "react";
import MensaTotalsTableJSX, {
  type MensaTotalsTableJSXProps,
} from "./MensaTotalsTableJSX";

export type MensaTotalsTableProps = MensaTotalsTableJSXProps;

// Nothing to work out: each row formats its own numbers.
const MensaTotalsTable: FC<MensaTotalsTableProps> = (props) => (
  <MensaTotalsTableJSX {...props} />
);

export default MensaTotalsTable;

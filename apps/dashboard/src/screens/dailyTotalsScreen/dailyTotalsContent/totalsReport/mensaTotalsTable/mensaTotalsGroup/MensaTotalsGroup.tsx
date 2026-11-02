import type { FC } from "react";
import MensaTotalsGroupJSX, {
  type MensaTotalsGroupJSXProps,
} from "./MensaTotalsGroupJSX";

export type MensaTotalsGroupProps = MensaTotalsGroupJSXProps;

// Nothing to work out: each row formats its own numbers.
const MensaTotalsGroup: FC<MensaTotalsGroupProps> = (props) => (
  <MensaTotalsGroupJSX {...props} />
);

export default MensaTotalsGroup;

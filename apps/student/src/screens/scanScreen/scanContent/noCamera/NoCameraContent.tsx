import type { FC } from "react";
import NoCameraContentJSX, {
  type NoCameraContentJSXProps,
} from "./NoCameraContentJSX";

export type NoCameraContentProps = NoCameraContentJSXProps;

// Nothing to work out: it shows what it is handed, so the props pass
// straight through to the markup.
const NoCameraContent: FC<NoCameraContentProps> = (props) => (
  <NoCameraContentJSX {...props} />
);

export default NoCameraContent;

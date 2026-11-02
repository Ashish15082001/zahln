import type { FC } from "react";
import PreferenceItemJSX, {
  type PreferenceItemJSXProps,
} from "./PreferenceItemJSX";

export type PreferenceItemProps = PreferenceItemJSXProps;

// Nothing to work out: it shows what it is handed, so the props pass
// straight through to the markup.
const PreferenceItem: FC<PreferenceItemProps> = (props) => (
  <PreferenceItemJSX {...props} />
);

export default PreferenceItem;

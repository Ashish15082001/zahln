import type { FC } from "react";
import MensaMenuJSX, { type MensaMenuJSXProps } from "./MensaMenuJSX";

export type MensaMenuProps = MensaMenuJSXProps;

// Nothing to work out: it shows what it is handed, so the props pass
// straight through to the markup.
const MensaMenu: FC<MensaMenuProps> = (props) => <MensaMenuJSX {...props} />;

export default MensaMenu;

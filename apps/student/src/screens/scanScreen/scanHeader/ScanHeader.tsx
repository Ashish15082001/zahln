import type { FC } from "react";
import ScanHeaderJSX, { type ScanHeaderJSXProps } from "./ScanHeaderJSX";

export type ScanHeaderProps = ScanHeaderJSXProps;

// Nothing to work out: it shows what it is handed, so the props pass
// straight through to the markup.
const ScanHeader: FC<ScanHeaderProps> = (props) => <ScanHeaderJSX {...props} />;

export default ScanHeader;

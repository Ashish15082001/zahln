import type { FC } from "react";
import CameraViewContentJSX, {
  type CameraViewContentJSXProps,
} from "./CameraViewContentJSX";

export type CameraViewContentProps = CameraViewContentJSXProps;

// Nothing to work out: it shows what it is handed, so the props pass
// straight through to the markup.
const CameraViewContent: FC<CameraViewContentProps> = (props) => (
  <CameraViewContentJSX {...props} />
);

export default CameraViewContent;

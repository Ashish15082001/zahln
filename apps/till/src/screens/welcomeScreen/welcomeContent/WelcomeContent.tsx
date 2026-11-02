import type { FC } from "react";
import WelcomeContentJSX, {
  type WelcomeContentJSXProps,
} from "./WelcomeContentJSX";

export type WelcomeContentProps = WelcomeContentJSXProps;

// Nothing to work out: it shows what it is handed, so the props pass
// straight through to the markup.
const WelcomeContent: FC<WelcomeContentProps> = (props) => (
  <WelcomeContentJSX {...props} />
);

export default WelcomeContent;

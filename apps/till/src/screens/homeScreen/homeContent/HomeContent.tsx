import type { FC } from "react";
import HomeContentJSX, { type HomeContentJSXProps } from "./HomeContentJSX";

export type HomeContentProps = HomeContentJSXProps;

// Nothing to work out: it shows what it is handed, so the props pass
// straight through to the markup.
const HomeContent: FC<HomeContentProps> = (props) => (
  <HomeContentJSX {...props} />
);

export default HomeContent;

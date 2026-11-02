import type { FC } from "react";
import HomeFooterJSX, { type HomeFooterJSXProps } from "./HomeFooterJSX";

export type HomeFooterProps = HomeFooterJSXProps;

// Nothing to work out: it shows what it is handed, so the props pass
// straight through to the markup.
const HomeFooter: FC<HomeFooterProps> = (props) => <HomeFooterJSX {...props} />;

export default HomeFooter;

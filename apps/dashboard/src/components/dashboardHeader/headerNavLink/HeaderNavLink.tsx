import type { FC } from "react";
import HeaderNavLinkJSX from "./HeaderNavLinkJSX";

export interface HeaderNavLinkProps {
  isCurrent: boolean;
  label: string;
  path: string;
}

const HeaderNavLink: FC<HeaderNavLinkProps> = ({ isCurrent, label, path }) => {
  // The current section looks selected, and aria-current says so to a screen
  // reader, which can't see the colour.
  const ariaCurrent = isCurrent ? "page" : undefined;
  const variant = isCurrent ? "secondary" : "ghost";

  return (
    <HeaderNavLinkJSX
      ariaCurrent={ariaCurrent}
      label={label}
      path={path}
      variant={variant}
    />
  );
};

export default HeaderNavLink;

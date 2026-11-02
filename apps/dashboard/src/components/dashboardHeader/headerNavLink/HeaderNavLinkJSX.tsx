import { Button } from "@zahln/ui/components/button";
import type { FC } from "react";
import { Link } from "react-router";

export interface HeaderNavLinkJSXProps {
  ariaCurrent: "page" | undefined;
  label: string;
  path: string;
  variant: "secondary" | "ghost";
}

/** One section of the header's nav. Goes straight inside its <ul>. */
const HeaderNavLinkJSX: FC<HeaderNavLinkJSXProps> = ({
  ariaCurrent,
  label,
  path,
  variant,
}) => (
  <li>
    {/* A link styled as a button: it opens another screen, and a screen
        reader says so. */}
    <Button asChild variant={variant}>
      <Link aria-current={ariaCurrent} to={path}>
        {label}
      </Link>
    </Button>
  </li>
);

export default HeaderNavLinkJSX;

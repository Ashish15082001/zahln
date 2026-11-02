import { Button } from "@zahln/ui/components/button";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import HeaderNavLink from "./headerNavLink/HeaderNavLink";

/** One section in the header's nav, ready to show. */
export interface NavLinkOption {
  // The screen on show belongs to this section.
  isCurrent: boolean;
  label: string;
  path: string;
}

export interface DashboardHeaderJSXProps {
  displayName: string;
  navLinkOptions: NavLinkOption[];
  handleLogOut: () => void;
}

const DashboardHeaderJSX: FC<DashboardHeaderJSXProps> = ({
  displayName,
  navLinkOptions,
  handleLogOut,
}) => {
  const { t } = useTranslation("dashboard");

  return (
    <>
      {/* Wraps on a phone, so the name and Log out drop below the app's name
          instead of squeezing it. */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="text-lg font-semibold">{t("appName")}</p>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">{displayName}</p>
          <Button type="button" variant="outline" onClick={handleLogOut}>
            {t("header.logOut")}
          </Button>
        </div>
      </div>
      {/* Named, so a screen reader's list of landmarks says what this nav
          is for. */}
      <nav aria-label={t("header.nav.label")}>
        <ul className="flex flex-wrap gap-1">
          {navLinkOptions.map((option) => (
            <HeaderNavLink
              key={option.path}
              isCurrent={option.isCurrent}
              label={option.label}
              path={option.path}
            />
          ))}
        </ul>
      </nav>
    </>
  );
};

export default DashboardHeaderJSX;

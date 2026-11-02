import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { matchPath, useLocation } from "react-router";
import { paths } from "../../app/paths";
import { logOut, useDashboardSession } from "../../data/session";
import DashboardHeaderJSX, { type NavLinkOption } from "./DashboardHeaderJSX";

/**
 * The header of every signed-in screen: the app's name, its sections, who is
 * logged in and Log out. Each screen puts it in ScreenLayoutJSX's header
 * slot, as the student app's screens do with theirs, rather than a layout
 * route wrapping every screen: ScreenLayoutJSX already makes the <header>
 * and <main> landmarks, and a shell around it would add a second set.
 */
const DashboardHeader: FC = () => {
  const { t } = useTranslation("dashboard");
  const { pathname } = useLocation();
  // Only reached signed in: SignedInOnly sends anyone else to Login. The
  // guard below narrows the type.
  const dashboardSession = useDashboardSession();
  if (dashboardSession.status !== "signedIn") return null;

  // The sections, in the order the header lists them.
  const navLinkOptions: NavLinkOption[] = [
    {
      isCurrent: matchPath(paths.dailyTotals, pathname) !== null,
      label: t("header.nav.dailyTotals"),
      path: paths.dailyTotals,
    },
    {
      // Not the end of the path, so a payment's detail under it counts too.
      isCurrent:
        matchPath({ path: paths.payments, end: false }, pathname) !== null,
      label: t("header.nav.payments"),
      path: paths.payments,
    },
  ];

  return (
    <DashboardHeaderJSX
      displayName={dashboardSession.financeUser.displayName}
      navLinkOptions={navLinkOptions}
      handleLogOut={logOut}
    />
  );
};

export default DashboardHeader;

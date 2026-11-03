import { useEffect, useRef, type FC } from "react";
import { useTranslation } from "react-i18next";
import RouteErrorScreenJSX from "./RouteErrorScreenJSX";

/**
 * In place of every screen when one can't open: its file didn't load, or it
 * threw while rendering. The router shows it as the top route's errorElement,
 * instead of React Router's developer error page.
 *
 * A file fails to load mostly after a deploy: a tab opened before it asks for
 * the old files, which are gone.
 */
const RouteErrorScreen: FC = () => {
  const { t } = useTranslation("common");
  const headingRef = useRef<HTMLHeadingElement>(null);

  // It takes the place of the screen finance was on, so focus moves to its
  // heading and a screen reader reads what happened, rather than staying on a
  // control that is gone.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  // Fetches index.html again, which names the files of the latest deploy.
  // The URL stays, so the same screen, day and filters open. The login in
  // this tab stays; the password, kept in memory only, goes.
  const handleReload = (): void => {
    window.location.reload();
  };

  return (
    <RouteErrorScreenJSX
      description={t("routeError.description")}
      headingRef={headingRef}
      reloadLabel={t("routeError.reload")}
      title={t("routeError.title")}
      handleReload={handleReload}
    />
  );
};

export default RouteErrorScreen;

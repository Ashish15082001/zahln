import { useEffect, useRef, type FC } from "react";
import { useTranslation } from "react-i18next";
import RouteErrorScreenJSX from "./RouteErrorScreenJSX";

/**
 * In place of every screen when one can't open: its file didn't load, or it
 * threw while rendering. The router shows it as the top route's errorElement,
 * instead of React Router's developer error page.
 */
const RouteErrorScreen: FC = () => {
  const { t } = useTranslation("common");
  const headingRef = useRef<HTMLHeadingElement>(null);

  // It takes the place of the screen the payer was on, so focus moves to its
  // heading and TalkBack reads what happened, rather than staying on a
  // control that is gone.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  // Starts the app again from the files on the phone. What is only in memory,
  // the password and any pay key, goes with it; the saved login stays.
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

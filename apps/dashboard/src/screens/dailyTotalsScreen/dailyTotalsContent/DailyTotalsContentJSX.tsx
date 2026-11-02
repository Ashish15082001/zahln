import type { FC } from "react";
import { useTranslation } from "react-i18next";

const DailyTotalsContentJSX: FC = () => {
  const { t } = useTranslation("dashboard");

  // The screen's heading is here, not in the header: the header is the same
  // on every screen, and this names the one on show.
  return <h1 className="text-2xl font-semibold">{t("dailyTotals.title")}</h1>;
};

export default DailyTotalsContentJSX;

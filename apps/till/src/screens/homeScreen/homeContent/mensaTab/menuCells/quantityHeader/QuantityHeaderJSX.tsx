import type { FC } from "react";
import { useTranslation } from "react-i18next";

// The header holds the column's width, so the table doesn't shift when the
// first dish is ticked and its buttons appear.
const QuantityHeaderJSX: FC = () => {
  const { t } = useTranslation("till");

  return <div className="w-36 text-right">{t("home.mensa.quantity")}</div>;
};

export default QuantityHeaderJSX;

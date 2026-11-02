import { formatCents } from "@zahln/i18n/format";
import { pickLanguage } from "@zahln/i18n/language";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import MoneyCellJSX from "./MoneyCellJSX";

export interface MoneyCellProps {
  amountCents: number;
}

const MoneyCell: FC<MoneyCellProps> = ({ amountCents }) => {
  const { i18n } = useTranslation("till");
  // i18next only resolves to a supported language. pickLanguage narrows the
  // type to AppLanguage, with English if that ever changes.
  const language = pickLanguage([i18n.resolvedLanguage ?? ""]);

  const amount = formatCents(amountCents, language);

  return <MoneyCellJSX amount={amount} />;
};

export default MoneyCell;

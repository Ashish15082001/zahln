import { formatDateTime } from "@zahln/i18n/format";
import { pickLanguage } from "@zahln/i18n/language";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import DateTimeCellJSX from "./DateTimeCellJSX";

export interface DateTimeCellProps {
  timeMs: number;
}

const DateTimeCell: FC<DateTimeCellProps> = ({ timeMs }) => {
  const { i18n } = useTranslation("dashboard");
  // i18next only resolves to a supported language. pickLanguage narrows the
  // type to AppLanguage, with English if that ever changes.
  const language = pickLanguage([i18n.resolvedLanguage ?? ""]);

  const dateTimeIso = new Date(timeMs).toISOString();
  const value = formatDateTime(timeMs, language);

  return <DateTimeCellJSX dateTimeIso={dateTimeIso} value={value} />;
};

export default DateTimeCell;

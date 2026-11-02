import {
  addDays,
  fromPickerDate,
  toPickerDate,
  type BerlinDay,
} from "@zahln/domain/day/berlinDay";
import { formatDay } from "@zahln/i18n/format";
import { pickLanguage, type AppLanguage } from "@zahln/i18n/language";
import { useState, type FC } from "react";
import type { Locale, Matcher } from "react-day-picker";
import { de, enUS } from "react-day-picker/locale";
import { useTranslation } from "react-i18next";
import DayPickerJSX from "./DayPickerJSX";

// The calendar's month and weekday names, in the app language.
const calendarLocales = {
  en: enUS,
  de,
} satisfies Record<AppLanguage, Locale>;

export interface DayPickerProps {
  day: BerlinDay;
  today: BerlinDay;
  handleDayChange: (day: BerlinDay) => void;
}

const DayPicker: FC<DayPickerProps> = ({ day, today, handleDayChange }) => {
  const { i18n } = useTranslation("dashboard");
  const language = pickLanguage([i18n.resolvedLanguage ?? ""]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const dayLabel = formatDay(day, language);
  const selectedDate = toPickerDate(day);
  // Days after today have no payments yet, so the calendar and Next stop at
  // today. Day strings compare like the days they name.
  const latestDate = toPickerDate(today);
  const disabledDays: Matcher = { after: latestDate };
  const isNextDisabled = day >= today;

  const handlePreviousDay = (): void => handleDayChange(addDays(day, -1));

  const handleNextDay = (): void => handleDayChange(addDays(day, 1));

  // Picking a day closes the calendar, so the totals it opens are in view.
  const handleCalendarSelect = (date: Date): void => {
    handleDayChange(fromPickerDate(date));
    setIsCalendarOpen(false);
  };

  return (
    <DayPickerJSX
      calendarLocale={calendarLocales[language]}
      dayLabel={dayLabel}
      disabledDays={disabledDays}
      isCalendarOpen={isCalendarOpen}
      isNextDisabled={isNextDisabled}
      latestDate={latestDate}
      selectedDate={selectedDate}
      handleCalendarOpenChange={setIsCalendarOpen}
      handleCalendarSelect={handleCalendarSelect}
      handleNextDay={handleNextDay}
      handlePreviousDay={handlePreviousDay}
    />
  );
};

export default DayPicker;

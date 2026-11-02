import {
  fromPickerDate,
  toPickerDate,
  type BerlinDay,
} from "@zahln/domain/day/berlinDay";
import { formatDay } from "@zahln/i18n/format";
import { pickLanguage, type AppLanguage } from "@zahln/i18n/language";
import { useState, type FC } from "react";
import type { DateRange, Locale, Matcher } from "react-day-picker";
import { de, enUS } from "react-day-picker/locale";
import { useTranslation } from "react-i18next";
import DateRangePickerJSX from "./DateRangePickerJSX";

// The calendar's month and weekday names, in the app language.
const calendarLocales = {
  en: enUS,
  de,
} satisfies Record<AppLanguage, Locale>;

export interface DateRangePickerProps {
  // Null when no day is picked: payments of any day.
  fromDay: BerlinDay | null;
  toDay: BerlinDay | null;
  today: BerlinDay;
  handleDaysChange: (
    fromDay: BerlinDay | null,
    toDay: BerlinDay | null,
  ) => void;
}

const DateRangePicker: FC<DateRangePickerProps> = ({
  fromDay,
  toDay,
  today,
  handleDaysChange,
}) => {
  const { t, i18n } = useTranslation("dashboard");
  const language = pickLanguage([i18n.resolvedLanguage ?? ""]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  // The days being picked, applied only with Apply: a range is two clicks,
  // and the first alone would start a search for one day.
  const [draftRange, setDraftRange] = useState<DateRange | undefined>(
    undefined,
  );

  let daysLabel = t("payments.filters.anyDay");
  if (fromDay !== null && toDay !== null) {
    daysLabel =
      fromDay === toDay
        ? formatDay(fromDay, language)
        : t("payments.filters.dayRange", {
            from: formatDay(fromDay, language),
            to: formatDay(toDay, language),
          });
  }
  const latestDate = toPickerDate(today);
  // Days after today have no payments yet.
  const disabledDays: Matcher = { after: latestDate };
  const isApplyDisabled = draftRange?.from === undefined;

  // Opening starts the draft from the days applied now, so the calendar shows
  // them and Apply without a change keeps them.
  const handleCalendarOpenChange = (isOpen: boolean): void => {
    if (isOpen) {
      setDraftRange(
        fromDay !== null && toDay !== null
          ? { from: toPickerDate(fromDay), to: toPickerDate(toDay) }
          : undefined,
      );
    }
    setIsCalendarOpen(isOpen);
  };

  const handleApplyDays = (): void => {
    if (draftRange?.from === undefined) return;
    // One click is one day: its start and its end.
    handleDaysChange(
      fromPickerDate(draftRange.from),
      fromPickerDate(draftRange.to ?? draftRange.from),
    );
    setIsCalendarOpen(false);
  };

  const handleClearDays = (): void => {
    handleDaysChange(null, null);
    setIsCalendarOpen(false);
  };

  return (
    <DateRangePickerJSX
      calendarLocale={calendarLocales[language]}
      daysLabel={daysLabel}
      defaultMonth={draftRange?.from ?? latestDate}
      disabledDays={disabledDays}
      draftRange={draftRange}
      isApplyDisabled={isApplyDisabled}
      isCalendarOpen={isCalendarOpen}
      latestDate={latestDate}
      handleApplyDays={handleApplyDays}
      handleCalendarOpenChange={handleCalendarOpenChange}
      handleClearDays={handleClearDays}
      handleDraftRangeChange={setDraftRange}
    />
  );
};

export default DateRangePicker;

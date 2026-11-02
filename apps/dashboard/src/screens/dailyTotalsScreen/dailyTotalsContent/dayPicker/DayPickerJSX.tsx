import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@zahln/ui/components/button";
import { Calendar } from "@zahln/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@zahln/ui/components/popover";
import type { FC } from "react";
import type { Locale, Matcher } from "react-day-picker";
import { useTranslation } from "react-i18next";

export interface DayPickerJSXProps {
  calendarLocale: Locale;
  dayLabel: string;
  disabledDays: Matcher;
  isCalendarOpen: boolean;
  isNextDisabled: boolean;
  // The last month the calendar can go to.
  latestDate: Date;
  selectedDate: Date;
  handleCalendarOpenChange: (isOpen: boolean) => void;
  handleCalendarSelect: (date: Date) => void;
  handleNextDay: () => void;
  handlePreviousDay: () => void;
}

/**
 * The day the totals are for: back a day, the day itself, which opens a
 * calendar, and forward a day. A group named "Day", so a screen reader says
 * what the three buttons choose.
 */
const DayPickerJSX: FC<DayPickerJSXProps> = ({
  calendarLocale,
  dayLabel,
  disabledDays,
  isCalendarOpen,
  isNextDisabled,
  latestDate,
  selectedDate,
  handleCalendarOpenChange,
  handleCalendarSelect,
  handleNextDay,
  handlePreviousDay,
}) => {
  const { t } = useTranslation("dashboard");

  return (
    <div
      aria-label={t("dailyTotals.dayPicker.label")}
      className="flex items-center gap-2"
      role="group"
    >
      {/* Icons only, so their labels name them. */}
      <Button
        aria-label={t("dailyTotals.dayPicker.previous")}
        size="icon"
        type="button"
        variant="outline"
        onClick={handlePreviousDay}
      >
        <HugeiconsIcon aria-hidden icon={ArrowLeft01Icon} />
      </Button>
      <Popover open={isCalendarOpen} onOpenChange={handleCalendarOpenChange}>
        <PopoverTrigger asChild>
          {/* A calendar icon before the date, like every date in the
              apps. */}
          <Button type="button" variant="outline">
            <HugeiconsIcon aria-hidden icon={Calendar03Icon} />
            {dayLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          {/* required: clicking the picked day again keeps it, rather than
              leaving no day. Weeks start on Monday, as in Germany, in
              English too. No autoFocus: the popover already moves the
              keyboard into the calendar when it opens. */}
          <Calendar
            required
            defaultMonth={selectedDate}
            disabled={disabledDays}
            endMonth={latestDate}
            locale={calendarLocale}
            mode="single"
            selected={selectedDate}
            weekStartsOn={1}
            onSelect={handleCalendarSelect}
          />
        </PopoverContent>
      </Popover>
      <Button
        aria-label={t("dailyTotals.dayPicker.next")}
        disabled={isNextDisabled}
        size="icon"
        type="button"
        variant="outline"
        onClick={handleNextDay}
      >
        <HugeiconsIcon aria-hidden icon={ArrowRight01Icon} />
      </Button>
    </div>
  );
};

export default DayPickerJSX;

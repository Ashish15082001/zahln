import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@zahln/ui/components/button";
import { Calendar } from "@zahln/ui/components/calendar";
import { Label } from "@zahln/ui/components/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@zahln/ui/components/popover";
import { useId, type FC } from "react";
import type { DateRange, Locale, Matcher } from "react-day-picker";
import { useTranslation } from "react-i18next";

export interface DateRangePickerJSXProps {
  calendarLocale: Locale;
  daysLabel: string;
  defaultMonth: Date;
  disabledDays: Matcher;
  draftRange: DateRange | undefined;
  isApplyDisabled: boolean;
  isCalendarOpen: boolean;
  // The last month the calendar can go to.
  latestDate: Date;
  handleApplyDays: () => void;
  handleCalendarOpenChange: (isOpen: boolean) => void;
  handleClearDays: () => void;
  handleDraftRangeChange: (draftRange: DateRange | undefined) => void;
}

/**
 * The days filter: a button with the days picked, which opens a calendar to
 * pick a range in, with Clear and Apply below it.
 */
const DateRangePickerJSX: FC<DateRangePickerJSXProps> = ({
  calendarLocale,
  daysLabel,
  defaultMonth,
  disabledDays,
  draftRange,
  isApplyDisabled,
  isCalendarOpen,
  latestDate,
  handleApplyDays,
  handleCalendarOpenChange,
  handleClearDays,
  handleDraftRangeChange,
}) => {
  const { t } = useTranslation("dashboard");
  const id = useId();
  const labelId = `${id}-label`;
  const triggerId = `${id}-trigger`;
  // The label, then the button's own text: a screen reader says "Days, Oct
  // 1 – Oct 20, 2026". The label alone would hide which days are picked.
  const triggerLabelIds = `${labelId} ${triggerId}`;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={triggerId} id={labelId}>
        {t("payments.filters.days")}
      </Label>
      <Popover open={isCalendarOpen} onOpenChange={handleCalendarOpenChange}>
        <PopoverTrigger asChild>
          {/* A calendar icon before the days, like every date in the
              apps. */}
          <Button
            aria-labelledby={triggerLabelIds}
            className="min-w-52 justify-start"
            id={triggerId}
            type="button"
            variant="outline"
          >
            <HugeiconsIcon aria-hidden icon={Calendar03Icon} />
            {daysLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="flex w-auto flex-col gap-3 p-3"
        >
          {/* Weeks start on Monday, as in Germany, in English too. */}
          <Calendar
            className="p-0"
            defaultMonth={defaultMonth}
            disabled={disabledDays}
            endMonth={latestDate}
            locale={calendarLocale}
            mode="range"
            selected={draftRange}
            weekStartsOn={1}
            onSelect={handleDraftRangeChange}
          />
          {/* Side by side at the same width, the main one on the right. */}
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" onClick={handleClearDays}>
              {t("payments.filters.clearDays")}
            </Button>
            <Button
              disabled={isApplyDisabled}
              type="button"
              onClick={handleApplyDays}
            >
              {t("payments.filters.applyDays")}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangePickerJSX;

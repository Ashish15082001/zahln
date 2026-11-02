import DateTimeJSX from "@zahln/ui/components/dateTime/DateTimeJSX";
import type { FC } from "react";

export interface DateTimeCellJSXProps {
  dateTimeIso: string;
  value: string;
}

const DateTimeCellJSX: FC<DateTimeCellJSXProps> = ({ dateTimeIso, value }) => (
  <DateTimeJSX dateTimeIso={dateTimeIso} value={value} />
);

export default DateTimeCellJSX;

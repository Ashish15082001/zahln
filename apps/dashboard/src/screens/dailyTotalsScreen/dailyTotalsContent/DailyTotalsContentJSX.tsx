import type { BerlinDay } from "@zahln/domain/day/berlinDay";
import type { FC } from "react";
import DayPicker from "./dayPicker/DayPicker";
import TotalsReport from "./totalsReport/TotalsReport";
import type { DailyTotalsState } from "./totalsReport/TotalsReportJSX";
import TotalsTitleRow, {
  type RefreshButtonState,
} from "./totalsTitleRow/TotalsTitleRow";

export interface DailyTotalsContentJSXProps {
  day: BerlinDay;
  // Null while there is nothing to refresh.
  refreshButtonState: RefreshButtonState | null;
  state: DailyTotalsState;
  today: BerlinDay;
  handleDayChange: (day: BerlinDay) => void;
  handleRefresh: () => void;
}

// The title and the day stay put in every state, so another day can be
// picked while one loads or after it failed.
const DailyTotalsContentJSX: FC<DailyTotalsContentJSXProps> = ({
  day,
  refreshButtonState,
  state,
  today,
  handleDayChange,
  handleRefresh,
}) => (
  <>
    <TotalsTitleRow
      refreshButtonState={refreshButtonState}
      handleRefresh={handleRefresh}
    />
    <DayPicker day={day} today={today} handleDayChange={handleDayChange} />
    <TotalsReport state={state} handleRefresh={handleRefresh} />
  </>
);

export default DailyTotalsContentJSX;

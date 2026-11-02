import type { BerlinDay } from "@zahln/domain/day/berlinDay";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import ScreenTitleRow, {
  type RefreshButtonState,
} from "../../../components/screenTitleRow/ScreenTitleRow";
import DayPicker from "./dayPicker/DayPicker";
import TotalsReport from "./totalsReport/TotalsReport";
import type { DailyTotalsState } from "./totalsReport/TotalsReportJSX";

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
}) => {
  const { t } = useTranslation("dashboard");

  return (
    <>
      {/* The description says how the server counts a day, so a refund of an
          earlier payment showing up today doesn't look like a mistake. */}
      <ScreenTitleRow
        description={t("dailyTotals.description")}
        refreshButtonState={refreshButtonState}
        title={t("dailyTotals.title")}
        handleRefresh={handleRefresh}
      />
      <DayPicker day={day} today={today} handleDayChange={handleDayChange} />
      <TotalsReport state={state} handleRefresh={handleRefresh} />
    </>
  );
};

export default DailyTotalsContentJSX;

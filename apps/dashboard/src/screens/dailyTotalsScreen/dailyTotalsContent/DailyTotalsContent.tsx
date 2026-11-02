import { parseBerlinDay, type BerlinDay } from "@zahln/domain/day/berlinDay";
import { formatDateTimeWithSeconds } from "@zahln/i18n/format";
import { pickLanguage } from "@zahln/i18n/language";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import { berlinToday, useDailyTotals } from "../../../data/dailyTotals";
import DailyTotalsContentJSX from "./DailyTotalsContentJSX";
import type { RefreshButtonState } from "./totalsTitleRow/TotalsTitleRow";
import type { DailyTotalsState } from "./totalsReport/TotalsReportJSX";

// The day shown is kept in the URL, so a reload or a shared link opens the
// same day. Left out, the screen shows today and follows it past midnight.
const DAY_SEARCH_PARAM = "date";

const DailyTotalsContent: FC = () => {
  const { i18n } = useTranslation("dashboard");
  // i18next only resolves to a supported language. pickLanguage narrows the
  // type to AppLanguage, with English if that ever changes.
  const language = pickLanguage([i18n.resolvedLanguage ?? ""]);
  const [searchParams, setSearchParams] = useSearchParams();

  const today = berlinToday();
  // A date that isn't a real day, e.g. one typed into the URL, shows today
  // rather than an error.
  const day = parseBerlinDay(searchParams.get(DAY_SEARCH_PARAM)) ?? today;
  const dailyTotalsQuery = useDailyTotals(day, day === today);

  // Data before error: a failed refresh doesn't make loaded totals wrong, so
  // they stay, with a note that they may be out of date.
  let state: DailyTotalsState = { status: "loading" };
  const report = dailyTotalsQuery.data;
  if (report !== undefined) {
    state = {
      status: "ready",
      dailyTotals: report.dailyTotals,
      isRefreshFailed: dailyTotalsQuery.isRefetchError,
      updatedAt: {
        dateTimeIso: new Date(report.receivedAtMs).toISOString(),
        value: formatDateTimeWithSeconds(report.receivedAtMs, language),
      },
    };
  } else if (dailyTotalsQuery.isError) {
    state = { status: "error", isRetrying: dailyTotalsQuery.isFetching };
  }

  // Only loaded totals can be refreshed. After a failed first load the
  // report offers Try again instead.
  const refreshButtonState: RefreshButtonState | null =
    state.status === "ready"
      ? {
          isDisabled: dailyTotalsQuery.isFetching,
          isRefreshing: dailyTotalsQuery.isRefetching,
        }
      : null;

  // Replaces the history entry instead of adding one, so Back leaves the
  // screen rather than stepping through every day looked at.
  const handleDayChange = (newDay: BerlinDay): void => {
    setSearchParams(newDay === today ? {} : { [DAY_SEARCH_PARAM]: newDay }, {
      replace: true,
    });
  };

  // refetch never rejects: a failure lands in the query's error state, which
  // the state above reads.
  const handleRefresh = (): void => {
    void dailyTotalsQuery.refetch();
  };

  return (
    <DailyTotalsContentJSX
      day={day}
      refreshButtonState={refreshButtonState}
      state={state}
      today={today}
      handleDayChange={handleDayChange}
      handleRefresh={handleRefresh}
    />
  );
};

export default DailyTotalsContent;

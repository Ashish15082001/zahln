import { WifiDisconnected01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { DailyTotals } from "@zahln/domain/dailyTotals/frontend";
import { Alert, AlertTitle } from "@zahln/ui/components/alert";
import { Button } from "@zahln/ui/components/button";
import DateTimeJSX from "@zahln/ui/components/dateTime/DateTimeJSX";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@zahln/ui/components/empty";
import { Skeleton } from "@zahln/ui/components/skeleton";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import MensaTotalsTable from "./mensaTotalsTable/MensaTotalsTable";
import TotalsTiles from "./totalsTiles/TotalsTiles";

/** A moment ready for DateTimeJSX. */
export interface DateTimeValue {
  dateTimeIso: string;
  value: string;
}

/** What the report shows, from first load to the totals. */
export type DailyTotalsState =
  | { status: "loading" }
  // The first load failed, so there is nothing to show.
  | { status: "error"; isRetrying: boolean }
  | {
      status: "ready";
      dailyTotals: DailyTotals;
      // The last refresh failed, so these may be out of date.
      isRefreshFailed: boolean;
      // When these totals arrived, on the server's clock.
      updatedAt: DateTimeValue;
    };

export interface TotalsReportJSXProps {
  state: DailyTotalsState;
  handleRefresh: () => void;
}

// One placeholder per tile, so the page doesn't jump when they arrive. A
// fixed list, so its names make stable keys.
const SKELETON_TILE_IDS = ["gross", "refunded", "net", "payments", "pending"];

const TotalsReportJSX: FC<TotalsReportJSXProps> = ({
  state,
  handleRefresh,
}) => {
  const { t } = useTranslation("dashboard");

  if (state.status === "loading") {
    return (
      // The grey blocks say nothing to a screen reader, so the status line
      // tells it the totals are on their way.
      <div className="flex flex-col gap-6" role="status">
        <span className="sr-only">{t("dailyTotals.loading")}</span>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {SKELETON_TILE_IDS.map((tileId) => (
            <Skeleton key={tileId} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <Empty className="flex-1">
        {/* An alert, so a screen reader reads out why the totals didn't
            come, in place of the loading line it just read. */}
        <EmptyHeader role="alert">
          <EmptyMedia variant="icon">
            <HugeiconsIcon aria-hidden icon={WifiDisconnected01Icon} />
          </EmptyMedia>
          {/* EmptyTitle is a div; the heading inside makes it one for a
              screen reader without changing how it looks. */}
          <EmptyTitle>
            <h2>{t("dailyTotals.errorTitle")}</h2>
          </EmptyTitle>
          <EmptyDescription>
            {t("dailyTotals.errorDescription")}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          {/* Disabled while retrying, so a second click can't start a second
              request. */}
          <Button
            disabled={state.isRetrying}
            type="button"
            variant="outline"
            onClick={handleRefresh}
          >
            {state.isRetrying
              ? t("dailyTotals.retrying")
              : t("dailyTotals.retry")}
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <>
      {/* Alerts have role="alert", so a screen reader reads them out as soon
          as they appear. */}
      {state.isRefreshFailed && (
        <Alert>
          <AlertTitle>{t("dailyTotals.refreshFailed")}</AlertTitle>
        </Alert>
      )}
      {/* How fresh the numbers are: today's move while the mensas are
          open. */}
      <p className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <span>{t("dailyTotals.updated")}</span>
        <DateTimeJSX
          dateTimeIso={state.updatedAt.dateTimeIso}
          value={state.updatedAt.value}
        />
      </p>
      <TotalsTiles totals={state.dailyTotals} />
      <MensaTotalsTable mensas={state.dailyTotals.mensas} />
    </>
  );
};

export default TotalsReportJSX;

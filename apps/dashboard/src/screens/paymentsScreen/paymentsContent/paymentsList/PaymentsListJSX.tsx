import {
  Invoice01Icon,
  WifiDisconnected01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { FinancePayment } from "@zahln/domain/payment/frontend";
import { Alert, AlertTitle } from "@zahln/ui/components/alert";
import { Button } from "@zahln/ui/components/button";
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
import PaymentTable from "../../../../components/paymentTable/PaymentTable";

/** Fetching the list again from the top, and how the last try went. */
export type RefreshStatus = "idle" | "refreshing" | "failed";

/** Whether there are older payments to load, and loading them. */
export type NextPageStatus = "none" | "available" | "loading" | "failed";

/** What the list shows, from first load to the payments. */
export type PaymentsListState =
  | { status: "loading" }
  // The first load failed, so there is nothing to show.
  | { status: "error"; isRetrying: boolean }
  // isFetching: some request for the list is on its way, so neither Refresh
  // nor Load more starts another that would cancel it.
  | { status: "empty"; isFetching: boolean; refresh: RefreshStatus }
  | {
      status: "ready";
      isFetching: boolean;
      nextPage: NextPageStatus;
      payments: FinancePayment[];
      refresh: RefreshStatus;
    };

export interface PaymentsListJSXProps {
  hasFilters: boolean;
  loadMoreLabel: string;
  // How many payments the list shows, e.g. "Shown: 50". Empty unless ready.
  shownCount: string;
  state: PaymentsListState;
  handleClearFilters: () => void;
  handleLoadMore: () => void;
  handleRefresh: () => void;
}

// One placeholder row per payment the first page usually fills a screen
// with. A fixed list, so its names make stable keys.
const SKELETON_ROW_IDS = ["row1", "row2", "row3", "row4", "row5", "row6"];

const PaymentsListJSX: FC<PaymentsListJSXProps> = ({
  hasFilters,
  loadMoreLabel,
  shownCount,
  state,
  handleClearFilters,
  handleLoadMore,
  handleRefresh,
}) => {
  const { t } = useTranslation("dashboard");

  if (state.status === "loading") {
    return (
      // The grey blocks say nothing to a screen reader, so the status line
      // tells it the payments are on their way.
      <div className="flex flex-col gap-3" role="status">
        <span className="sr-only">{t("payments.loading")}</span>
        {SKELETON_ROW_IDS.map((rowId) => (
          <Skeleton key={rowId} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <Empty className="flex-1">
        {/* An alert, so a screen reader reads out why the list didn't come,
            in place of the loading line it just read. */}
        <EmptyHeader role="alert">
          <EmptyMedia variant="icon">
            <HugeiconsIcon aria-hidden icon={WifiDisconnected01Icon} />
          </EmptyMedia>
          {/* EmptyTitle is a div; the heading inside makes it one for a
              screen reader without changing how it looks. */}
          <EmptyTitle>
            <h2>{t("payments.errorTitle")}</h2>
          </EmptyTitle>
          <EmptyDescription>{t("payments.errorDescription")}</EmptyDescription>
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
            {state.isRetrying ? t("payments.retrying") : t("payments.retry")}
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  if (state.status === "empty") {
    return (
      <>
        {state.refresh === "failed" && (
          <Alert>
            <AlertTitle>{t("payments.refreshFailed")}</AlertTitle>
          </Alert>
        )}
        <Empty className="flex-1">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon aria-hidden icon={Invoice01Icon} />
            </EmptyMedia>
            <EmptyTitle>
              <h2>{t("payments.emptyTitle")}</h2>
            </EmptyTitle>
            <EmptyDescription>
              {t("payments.emptyDescription")}
            </EmptyDescription>
          </EmptyHeader>
          {/* The way out of an empty list is the filters that made it. */}
          {hasFilters && (
            <EmptyContent>
              <Button
                type="button"
                variant="outline"
                onClick={handleClearFilters}
              >
                {t("payments.filters.clear")}
              </Button>
            </EmptyContent>
          )}
        </Empty>
      </>
    );
  }

  return (
    <>
      {/* Alerts have role="alert", so a screen reader reads them out as soon
          as they appear. */}
      {state.refresh === "failed" && (
        <Alert>
          <AlertTitle>{t("payments.refreshFailed")}</AlertTitle>
        </Alert>
      )}
      <PaymentTable payments={state.payments} />
      {state.nextPage === "failed" && (
        <Alert variant="destructive">
          <AlertTitle>{t("payments.loadMoreFailed")}</AlertTitle>
        </Alert>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{shownCount}</p>
        {/* Disabled during any request for the list, so a click can't cancel
            a refresh, or load the same page twice. */}
        {state.nextPage !== "none" && (
          <Button
            disabled={state.isFetching}
            type="button"
            variant="outline"
            onClick={handleLoadMore}
          >
            {loadMoreLabel}
          </Button>
        )}
      </div>
    </>
  );
};

export default PaymentsListJSX;

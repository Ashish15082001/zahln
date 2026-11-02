import {
  Invoice01Icon,
  WifiDisconnected01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";
import type { CashierPayment } from "@zahln/domain/payment/frontend";
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
import DataTable, {
  type DataTableFeatures,
} from "../../../../components/dataTable/DataTable";
import { getPaymentRowId } from "./paymentColumns";
import PaymentsTabHeader, {
  type RefreshButtonState,
} from "./paymentsTabHeader/PaymentsTabHeader";

/** Fetching the list again from the top, and how the last try went. */
export type RefreshStatus = "idle" | "refreshing" | "failed";

/** Whether there are older payments to load, and loading them. */
export type NextPageStatus = "none" | "available" | "loading" | "failed";

/** What the tab shows, from first load to the payments. */
export type PaymentsTabState =
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
      payments: CashierPayment[];
      refresh: RefreshStatus;
    };

export interface PaymentsTabJSXProps {
  columns: ColumnDef<DataTableFeatures, CashierPayment>[];
  loadMoreLabel: string;
  // Null while there is nothing to refresh.
  refreshButtonState: RefreshButtonState | null;
  state: PaymentsTabState;
  handleLoadMore: () => void;
  handleRefresh: () => void;
}

const PaymentsTabJSX: FC<PaymentsTabJSXProps> = ({
  columns,
  loadMoreLabel,
  refreshButtonState,
  state,
  handleLoadMore,
  handleRefresh,
}) => {
  const { t } = useTranslation("till");

  if (state.status === "loading") {
    return (
      <div className="flex flex-col gap-4">
        <PaymentsTabHeader
          refreshButtonState={refreshButtonState}
          handleRefresh={handleRefresh}
        />
        {/* The grey blocks say nothing to a screen reader, so the status line
            tells TalkBack the payments are on their way. */}
        <div className="flex flex-col gap-3" role="status">
          <span className="sr-only">{t("home.payments.loading")}</span>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex flex-col gap-4">
        <PaymentsTabHeader
          refreshButtonState={refreshButtonState}
          handleRefresh={handleRefresh}
        />
        <Empty>
          {/* An alert, so TalkBack reads out why the list didn't come, in
              place of the loading line it just read. */}
          <EmptyHeader role="alert">
            <EmptyMedia variant="icon">
              <HugeiconsIcon aria-hidden icon={WifiDisconnected01Icon} />
            </EmptyMedia>
            {/* EmptyTitle is a div; the heading inside makes it one for a
                screen reader without changing how it looks. */}
            <EmptyTitle>
              <h3>{t("home.payments.errorTitle")}</h3>
            </EmptyTitle>
            <EmptyDescription>
              {t("home.payments.errorDescription")}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            {/* Disabled while retrying, so a second tap can't start a second
                request. */}
            <Button
              disabled={state.isRetrying}
              variant="outline"
              onClick={handleRefresh}
            >
              {state.isRetrying
                ? t("home.payments.retrying")
                : t("home.payments.retry")}
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  // Empty and ready both show what the server last said, so both say so
  // when a refresh fails.
  if (state.status === "empty") {
    return (
      <div className="flex flex-col gap-4">
        <PaymentsTabHeader
          refreshButtonState={refreshButtonState}
          handleRefresh={handleRefresh}
        />
        {state.refresh === "failed" && (
          <Alert>
            <AlertTitle>{t("home.payments.refreshFailed")}</AlertTitle>
          </Alert>
        )}
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon aria-hidden icon={Invoice01Icon} />
            </EmptyMedia>
            <EmptyTitle>
              <h3>{t("home.payments.emptyTitle")}</h3>
            </EmptyTitle>
            <EmptyDescription>
              {t("home.payments.emptyDescription")}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PaymentsTabHeader
        refreshButtonState={refreshButtonState}
        handleRefresh={handleRefresh}
      />
      {state.refresh === "failed" && (
        <Alert>
          <AlertTitle>{t("home.payments.refreshFailed")}</AlertTitle>
        </Alert>
      )}
      <DataTable
        columns={columns}
        data={state.payments}
        emptyText={t("home.payments.emptyTitle")}
        getRowId={getPaymentRowId}
      />
      {state.nextPage === "failed" && (
        <Alert variant="destructive">
          <AlertTitle>{t("home.payments.loadMoreFailed")}</AlertTitle>
        </Alert>
      )}
      {state.nextPage !== "none" && (
        <div className="flex justify-center">
          <Button
            disabled={state.isFetching}
            variant="outline"
            onClick={handleLoadMore}
          >
            {loadMoreLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PaymentsTabJSX;

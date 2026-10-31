import {
  Invoice01Icon,
  WifiDisconnected01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Payment } from "@zahln/domain/payment/frontend";
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
import { useId, type FC } from "react";
import { useTranslation } from "react-i18next";
import PaymentRow from "./paymentRow/PaymentRow";

/** Fetching the list again from the top, and how the last try went. */
export type RefreshStatus = "idle" | "refreshing" | "failed";

/** Whether there are older payments to load, and loading them. */
export type NextPageStatus = "none" | "available" | "loading" | "failed";

/** What the list shows, from first load to the payments. */
export type PaymentListState =
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
      payments: Payment[];
      refresh: RefreshStatus;
    };

export interface PaymentListJSXProps {
  state: PaymentListState;
  handleLoadMore: () => void;
  handleRefresh: () => void;
}

// Every state is the same section, named by its heading, so TalkBack users
// can jump to it from the greeting. flex-1 lets the empty and error states
// fill the rest of the page.
const SECTION_CLASS_NAME = "flex flex-1 flex-col gap-4 pt-8";

const PaymentListJSX: FC<PaymentListJSXProps> = ({
  state,
  handleLoadMore,
  handleRefresh,
}) => {
  const { t } = useTranslation("student");
  const headingId = useId();

  const heading = (
    <h2 id={headingId} className="text-xl font-semibold">
      {t("home.payments.title")}
    </h2>
  );

  if (state.status === "loading") {
    return (
      <section aria-labelledby={headingId} className={SECTION_CLASS_NAME}>
        {heading}
        {/* The grey blocks say nothing to a screen reader, so the status line
            tells TalkBack the payments are on their way. */}
        <div className="flex flex-col gap-3" role="status">
          <span className="sr-only">{t("home.payments.loading")}</span>
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section aria-labelledby={headingId} className={SECTION_CLASS_NAME}>
        {heading}
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
      </section>
    );
  }

  // Empty and ready both show what the server last said, so both can be
  // refreshed, and both say so when a refresh fails.
  const refreshLabel =
    state.refresh === "refreshing"
      ? t("home.payments.refreshing")
      : t("home.payments.refresh");
  const header = (
    <div className="flex items-center justify-between gap-4">
      {heading}
      <Button
        disabled={state.isFetching}
        variant="outline"
        onClick={handleRefresh}
      >
        {refreshLabel}
      </Button>
    </div>
  );
  const refreshFailedAlert = state.refresh === "failed" && (
    <Alert>
      <AlertTitle>{t("home.payments.refreshFailed")}</AlertTitle>
    </Alert>
  );

  if (state.status === "empty") {
    return (
      <section aria-labelledby={headingId} className={SECTION_CLASS_NAME}>
        {header}
        {refreshFailedAlert}
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
      </section>
    );
  }

  // After a failed load, the same button tries that page again.
  let loadMoreLabel = t("home.payments.loadMore");
  if (state.nextPage === "loading") {
    loadMoreLabel = t("home.payments.loadingMore");
  } else if (state.nextPage === "failed") {
    loadMoreLabel = t("home.payments.retry");
  }

  return (
    <section aria-labelledby={headingId} className={SECTION_CLASS_NAME}>
      {header}
      {refreshFailedAlert}
      <ul className="divide-y">
        {state.payments.map((payment) => (
          <PaymentRow key={payment.id} payment={payment} />
        ))}
      </ul>
      {state.nextPage === "failed" && (
        <Alert variant="destructive">
          <AlertTitle>{t("home.payments.loadMoreFailed")}</AlertTitle>
        </Alert>
      )}
      {state.nextPage !== "none" && (
        <Button
          disabled={state.isFetching}
          variant="outline"
          onClick={handleLoadMore}
        >
          {loadMoreLabel}
        </Button>
      )}
    </section>
  );
};

export default PaymentListJSX;

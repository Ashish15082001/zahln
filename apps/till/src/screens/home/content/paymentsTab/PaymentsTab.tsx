import { pickLanguage } from "@zahln/i18n/language";
import { useMemo, type FC } from "react";
import { useTranslation } from "react-i18next";
import { usePayments } from "../../../../data/payments";
import { getPaymentColumns } from "./paymentColumns";
import PaymentsTabJSX, {
  type NextPageStatus,
  type PaymentsTabState,
  type RefreshStatus,
} from "./PaymentsTabJSX";

export interface PaymentsTabProps {
  /** The tab is on screen. The list is only fetched then. */
  isShown: boolean;
}

const PaymentsTab: FC<PaymentsTabProps> = ({ isShown }) => {
  const paymentsQuery = usePayments(isShown);
  const { t, i18n } = useTranslation("till");
  // i18next only resolves to a supported language. pickLanguage narrows the
  // type to AppLanguage, with English if that ever changes.
  const language = pickLanguage([i18n.resolvedLanguage ?? ""]);
  // The table needs the same columns from one render to the next. They only
  // change with the language, since their headers, dates and amounts are
  // written in it.
  const columns = useMemo(() => getPaymentColumns(t, language), [t, language]);

  // Data before error: a failed refresh doesn't make loaded payments wrong,
  // so they stay, with a note that they may be out of date.
  let state: PaymentsTabState = { status: "loading" };
  const payments = paymentsQuery.data;
  if (payments !== undefined) {
    let refresh: RefreshStatus = "idle";
    if (paymentsQuery.isRefetching) refresh = "refreshing";
    else if (paymentsQuery.isRefetchError) refresh = "failed";

    let nextPage: NextPageStatus = "none";
    if (paymentsQuery.isFetchingNextPage) nextPage = "loading";
    else if (paymentsQuery.isFetchNextPageError) nextPage = "failed";
    else if (paymentsQuery.hasNextPage) nextPage = "available";

    state =
      payments.length === 0
        ? { status: "empty", isFetching: paymentsQuery.isFetching, refresh }
        : {
            status: "ready",
            isFetching: paymentsQuery.isFetching,
            nextPage,
            payments,
            refresh,
          };
  } else if (paymentsQuery.isError) {
    state = { status: "error", isRetrying: paymentsQuery.isFetching };
  }

  // refetch and fetchNextPage never reject: a failure lands in the query's
  // error state, which the state above reads.
  const handleLoadMore = (): void => {
    void paymentsQuery.fetchNextPage();
  };

  const handleRefresh = (): void => {
    void paymentsQuery.refetch();
  };

  return (
    <PaymentsTabJSX
      columns={columns}
      state={state}
      handleLoadMore={handleLoadMore}
      handleRefresh={handleRefresh}
    />
  );
};

export default PaymentsTab;

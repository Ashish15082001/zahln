import { useEffect, useMemo, useRef, type FC } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router";
import { paths } from "../../../app/paths";
import type { RefreshButtonState } from "../../../components/screenTitleRow/ScreenTitleRow";
import {
  findListedPayment,
  isPaymentNotFound,
  useFinancePayment,
} from "../../../data/payments";
import PaymentDetailContentJSX from "./PaymentDetailContentJSX";
import type { PaymentDetailState } from "./paymentDetailReport/PaymentDetailReportJSX";

const PaymentDetailContent: FC = () => {
  const { t } = useTranslation("dashboard");
  // The route always has the id; the default only satisfies the type.
  const { paymentId = "" } = useParams<"paymentId">();
  const paymentQuery = useFinancePayment(paymentId);
  // What a list showed for this payment, read once per id. It fills the
  // facts and items while the refunds and history load; the detail replaces
  // it.
  const listedPayment = useMemo(
    () => findListedPayment(paymentId),
    [paymentId],
  );
  const navigate = useNavigate();
  const location = useLocation();
  const headingRef = useRef<HTMLHeadingElement>(null);

  // A screen reader starts reading the new screen at its heading, rather than
  // wherever focus was left on the list.
  useEffect(() => {
    headingRef.current?.focus();
  }, [paymentId]);

  // Data before error: a failed refresh doesn't make a loaded payment wrong,
  // so it stays, with a note that it may be out of date.
  let state: PaymentDetailState = listedPayment
    ? { status: "loadingRest", listedPayment }
    : { status: "loading" };
  const payment = paymentQuery.data;
  if (payment !== undefined) {
    state = {
      status: "ready",
      isRefreshFailed: paymentQuery.isRefetchError,
      payment,
    };
  } else if (paymentQuery.isError) {
    state = isPaymentNotFound(paymentQuery.error)
      ? { status: "notFound" }
      : { status: "error", isRetrying: paymentQuery.isFetching };
  }

  // Only a loaded payment can be refreshed; the other states have their own
  // way forward, or none.
  const refreshButtonState: RefreshButtonState | null =
    state.status === "ready"
      ? {
          isDisabled: paymentQuery.isFetching,
          isRefreshing: paymentQuery.isRefetching,
        }
      : null;

  // Back to where finance came from, with its filters and scroll, so this
  // button and the browser's agree. Opened straight from a link there is
  // nowhere to go back to, so it opens the payment search in its place.
  const handleBack = (): void => {
    if (location.key === "default") {
      void navigate(paths.payments, { replace: true });
    } else {
      void navigate(-1);
    }
  };

  // refetch never rejects: a failure lands in the query's error state.
  const handleRefresh = (): void => {
    void paymentQuery.refetch();
  };

  return (
    <PaymentDetailContentJSX
      headingRef={headingRef}
      paymentId={paymentId}
      refreshButtonState={refreshButtonState}
      state={state}
      title={t("paymentDetail.title")}
      handleBack={handleBack}
      handleRefresh={handleRefresh}
    />
  );
};

export default PaymentDetailContent;

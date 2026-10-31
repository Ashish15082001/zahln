import { useEffect, useMemo, useRef, type FC } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { paths } from "../../app/paths";
import {
  findListedPayment,
  isPaymentNotFound,
  usePayment,
} from "../../data/payments";
import PaymentDetailJSX, {
  type PaymentDetailState,
  type RefreshStatus,
} from "./PaymentDetailJSX";

const PaymentDetail: FC = () => {
  // The route always has the id; the default only satisfies the type.
  const { paymentId = "" } = useParams<"paymentId">();
  const paymentQuery = usePayment(paymentId);
  // What the list showed for this payment, read once per id. It fills the
  // screen while the refunds and history load; the detail replaces it.
  const listedPayment = useMemo(
    () => findListedPayment(paymentId),
    [paymentId],
  );
  const navigate = useNavigate();
  const location = useLocation();
  const headingRef = useRef<HTMLHeadingElement>(null);

  // TalkBack starts reading the new screen at its heading, rather than
  // wherever focus was left on the list.
  useEffect(() => {
    headingRef.current?.focus();
  }, [paymentId]);

  // Data before error: a failed refresh doesn't make a loaded payment wrong.
  let state: PaymentDetailState = { status: "loading", listedPayment };
  const payment = paymentQuery.data;
  if (payment !== undefined) {
    let refresh: RefreshStatus = "idle";
    if (paymentQuery.isRefetching) refresh = "refreshing";
    else if (paymentQuery.isRefetchError) refresh = "failed";
    state = { status: "ready", payment, refresh };
  } else if (paymentQuery.isError) {
    state = isPaymentNotFound(paymentQuery.error)
      ? { status: "notFound" }
      : { status: "error", isRetrying: paymentQuery.isFetching };
  }

  // Back to where the payer came from, so this button and Android's agree.
  // Opened straight from a link there is nowhere to go back to, so it opens
  // the list in place of this screen.
  const handleBack = (): void => {
    if (location.key === "default") {
      void navigate(paths.home, { replace: true });
    } else {
      void navigate(-1);
    }
  };

  // refetch never rejects: a failure lands in the query's error state.
  const handleRefresh = (): void => {
    void paymentQuery.refetch();
  };

  return (
    <PaymentDetailJSX
      headingRef={headingRef}
      state={state}
      handleBack={handleBack}
      handleRefresh={handleRefresh}
    />
  );
};

export default PaymentDetail;

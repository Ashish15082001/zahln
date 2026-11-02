import type { FC } from "react";
import { useDashboardSession } from "../../data/session";
import PaymentDetailScreenJSX from "./PaymentDetailScreenJSX";

// Only reached signed in: SignedInOnly sends anyone else to Login. The guard
// covers the render in which a log-out lands, so no part of the screen shows
// then.
const PaymentDetailScreen: FC = () => {
  const dashboardSession = useDashboardSession();
  if (dashboardSession.status !== "signedIn") return null;

  return <PaymentDetailScreenJSX />;
};

export default PaymentDetailScreen;

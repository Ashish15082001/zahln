import { createBrowserRouter, Navigate } from "react-router";
import AttentionScreen from "../screens/attentionScreen/AttentionScreen";
import DailyTotalsScreen from "../screens/dailyTotalsScreen/DailyTotalsScreen";
import LoginScreen from "../screens/loginScreen/LoginScreen";
import PaymentDetailScreen from "../screens/paymentDetailScreen/PaymentDetailScreen";
import PaymentsScreen from "../screens/paymentsScreen/PaymentsScreen";
import { paths } from "./paths";
import SignedInOnly from "./signedInOnly/SignedInOnly";
import SignedOutOnly from "./signedOutOnly/SignedOutOnly";

export const router = createBrowserRouter([
  // Pathless layout routes: the guards decide who may see their screens, so
  // no screen checks the session just to redirect.
  {
    element: <SignedOutOnly />,
    children: [{ path: paths.login, element: <LoginScreen /> }],
  },
  {
    element: <SignedInOnly />,
    children: [
      { path: paths.dailyTotals, element: <DailyTotalsScreen /> },
      { path: paths.attention, element: <AttentionScreen /> },
      { path: paths.payments, element: <PaymentsScreen /> },
      { path: paths.payment, element: <PaymentDetailScreen /> },
    ],
  },
  // The static host serves index.html for any path, so an unknown one would
  // otherwise show React Router's developer error page.
  { path: "*", element: <Navigate replace to={paths.dailyTotals} /> },
]);

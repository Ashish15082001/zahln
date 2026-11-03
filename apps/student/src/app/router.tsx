import { createBrowserRouter, Navigate } from "react-router";
import HomeScreen from "../screens/homeScreen/HomeScreen";
import LoginScreen from "../screens/loginScreen/LoginScreen";
import OrderScreen from "../screens/orderScreen/OrderScreen";
import PayScreen from "../screens/payScreen/PayScreen";
import PaymentDetailScreen from "../screens/paymentDetailScreen/PaymentDetailScreen";
import ProfileScreen from "../screens/profileScreen/ProfileScreen";
import ScanScreen from "../screens/scanScreen/ScanScreen";
import WelcomeScreen from "../screens/welcomeScreen/WelcomeScreen";
import { paths } from "./paths";
import SignedInOnly from "./signedInOnly/SignedInOnly";
import SignedOutOnly from "./signedOutOnly/SignedOutOnly";
import SupportedVersionOnly from "./supportedVersionOnly/SupportedVersionOnly";

export const router = createBrowserRouter([
  // Pathless layout routes: the guards decide who may see their screens, so
  // no screen checks the session or the app's version just to redirect. The
  // version comes first, since an app too old to pay is too old to log in.
  {
    element: <SupportedVersionOnly />,
    children: [
      {
        element: <SignedOutOnly />,
        children: [
          { path: paths.welcome, element: <WelcomeScreen /> },
          { path: paths.login, element: <LoginScreen /> },
        ],
      },
      {
        element: <SignedInOnly />,
        children: [
          { path: paths.home, element: <HomeScreen /> },
          { path: paths.payment, element: <PaymentDetailScreen /> },
          { path: paths.order, element: <OrderScreen /> },
          { path: paths.pay, element: <PayScreen /> },
          { path: paths.scan, element: <ScanScreen /> },
          { path: paths.profile, element: <ProfileScreen /> },
        ],
      },
      // Capacitor and Vite serve index.html for any path, so an unknown one
      // would otherwise show React Router's developer error page to the payer.
      { path: "*", element: <Navigate replace to={paths.welcome} /> },
    ],
  },
]);

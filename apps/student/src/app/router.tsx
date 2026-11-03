import type { ComponentType } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import RouteErrorScreen from "../screens/routeErrorScreen/RouteErrorScreen";
import { paths } from "./paths";
import SignedInOnly from "./signedInOnly/SignedInOnly";
import SignedOutOnly from "./signedOutOnly/SignedOutOnly";
import SupportedVersionOnly from "./supportedVersionOnly/SupportedVersionOnly";

/**
 * A screen whose file loads the first time it is opened, so starting the app
 * parses only the screens it shows, not all of them in one file. The router
 * loads it before it leaves the screen before, so nothing blank shows between
 * two screens.
 */
const lazyScreen = (loadScreen: () => Promise<{ default: ComponentType }>) => ({
  Component: async () => (await loadScreen()).default,
});

export const router = createBrowserRouter([
  // Pathless layout routes: the guards decide who may see their screens, so
  // no screen checks the session or the app's version just to redirect. The
  // version comes first, since an app too old to pay is too old to log in.
  // The guards load with the app: every screen needs them.
  {
    element: <SupportedVersionOnly />,
    // A screen whose file fails to load, or that throws, shows this in place
    // of every screen.
    errorElement: <RouteErrorScreen />,
    // What shows while the first screen's file loads, a moment from the
    // phone's own disk: nothing, rather than a spinner that would only flash.
    // Given at all so React Router doesn't warn that there is none.
    hydrateFallbackElement: <></>,
    children: [
      {
        element: <SignedOutOnly />,
        children: [
          {
            path: paths.welcome,
            lazy: lazyScreen(
              () => import("../screens/welcomeScreen/WelcomeScreen"),
            ),
          },
          {
            path: paths.login,
            lazy: lazyScreen(
              () => import("../screens/loginScreen/LoginScreen"),
            ),
          },
        ],
      },
      {
        element: <SignedInOnly />,
        children: [
          {
            path: paths.home,
            lazy: lazyScreen(() => import("../screens/homeScreen/HomeScreen")),
          },
          {
            path: paths.payment,
            lazy: lazyScreen(
              () =>
                import("../screens/paymentDetailScreen/PaymentDetailScreen"),
            ),
          },
          {
            path: paths.order,
            lazy: lazyScreen(
              () => import("../screens/orderScreen/OrderScreen"),
            ),
          },
          {
            path: paths.pay,
            lazy: lazyScreen(() => import("../screens/payScreen/PayScreen")),
          },
          {
            path: paths.scan,
            lazy: lazyScreen(() => import("../screens/scanScreen/ScanScreen")),
          },
          {
            path: paths.profile,
            lazy: lazyScreen(
              () => import("../screens/profileScreen/ProfileScreen"),
            ),
          },
        ],
      },
      // Capacitor and Vite serve index.html for any path, so an unknown one
      // would otherwise show React Router's developer error page to the payer.
      { path: "*", element: <Navigate replace to={paths.welcome} /> },
    ],
  },
]);

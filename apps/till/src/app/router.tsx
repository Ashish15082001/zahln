import type { ComponentType } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import RouteErrorScreen from "../screens/routeErrorScreen/RouteErrorScreen";
import { paths } from "./paths";
import SignedInOnly from "./signedInOnly/SignedInOnly";
import SignedOutOnly from "./signedOutOnly/SignedOutOnly";

/**
 * A screen whose file loads the first time it is opened, so starting the
 * till parses only the screens it shows, not all of them in one file. The
 * router loads it before it leaves the screen before, so nothing blank shows
 * between two screens.
 */
const lazyScreen = (loadScreen: () => Promise<{ default: ComponentType }>) => ({
  Component: async () => (await loadScreen()).default,
});

export const router = createBrowserRouter([
  // One pathless route above everything, with no element of its own, so the
  // error screen and the start-up fallback cover every route.
  {
    // A screen whose file fails to load, or that throws, shows this in place
    // of every screen.
    errorElement: <RouteErrorScreen />,
    // What shows while the first screen's file loads, a moment from the
    // tablet's own disk: nothing, rather than a spinner that would only
    // flash. Given at all so React Router doesn't warn that there is none.
    hydrateFallbackElement: <></>,
    children: [
      // Pathless layout routes: the guards decide who may see their screens,
      // so no screen checks the session just to redirect. The guards load
      // with the app: every screen needs them.
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
        ],
      },
      // Capacitor and Vite serve index.html for any path, so an unknown one
      // would otherwise show React Router's developer error page to the
      // cashier.
      { path: "*", element: <Navigate replace to={paths.welcome} /> },
    ],
  },
]);

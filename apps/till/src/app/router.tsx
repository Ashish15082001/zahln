import { createBrowserRouter, Navigate } from "react-router";
import HomeScreen from "../screens/homeScreen/HomeScreen";
import LoginScreen from "../screens/loginScreen/LoginScreen";
import WelcomeScreen from "../screens/welcomeScreen/WelcomeScreen";
import { paths } from "./paths";
import SignedInOnly from "./signedInOnly/SignedInOnly";
import SignedOutOnly from "./signedOutOnly/SignedOutOnly";

export const router = createBrowserRouter([
  // Pathless layout routes: the guards decide who may see their screens, so
  // no screen checks the session just to redirect.
  {
    element: <SignedOutOnly />,
    children: [
      { path: paths.welcome, element: <WelcomeScreen /> },
      { path: paths.login, element: <LoginScreen /> },
    ],
  },
  {
    element: <SignedInOnly />,
    children: [{ path: paths.home, element: <HomeScreen /> }],
  },
  // Capacitor and Vite serve index.html for any path, so an unknown one would
  // otherwise show React Router's developer error page to the cashier.
  { path: "*", element: <Navigate replace to={paths.welcome} /> },
]);

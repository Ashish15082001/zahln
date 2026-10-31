import { createBrowserRouter, Navigate } from "react-router";
import Home from "../screens/home/Home";
import Login from "../screens/login/Login";
import Welcome from "../screens/welcome/Welcome";
import { paths } from "./paths";
import SignedInOnly from "./signedInOnly/SignedInOnly";
import SignedOutOnly from "./signedOutOnly/SignedOutOnly";

export const router = createBrowserRouter([
  // Pathless layout routes: the guards decide who may see their screens, so
  // no screen checks the session just to redirect.
  {
    element: <SignedOutOnly />,
    children: [
      { path: paths.welcome, element: <Welcome /> },
      { path: paths.login, element: <Login /> },
    ],
  },
  {
    element: <SignedInOnly />,
    children: [{ path: paths.home, element: <Home /> }],
  },
  // Capacitor and Vite serve index.html for any path, so an unknown one would
  // otherwise show React Router's developer error page to the payer.
  { path: "*", element: <Navigate replace to={paths.welcome} /> },
]);

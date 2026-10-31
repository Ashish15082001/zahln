import { createBrowserRouter, Navigate } from "react-router";
import Home from "../screens/home/Home";
import Login from "../screens/login/Login";
import Welcome from "../screens/welcome/Welcome";
import { paths } from "./paths";

export const router = createBrowserRouter([
  { path: paths.welcome, element: <Welcome /> },
  { path: paths.login, element: <Login /> },
  { path: paths.home, element: <Home /> },
  // Capacitor and Vite serve index.html for any path, so an unknown one would
  // otherwise show React Router's developer error page to the cashier.
  { path: "*", element: <Navigate replace to={paths.welcome} /> },
]);

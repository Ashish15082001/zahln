import type { FC } from "react";
import { RouterProvider } from "react-router/dom";
import { router } from "./router";

// RouterProvider from react-router/dom is the one wired to react-dom. The core
// package's version leaves react-dom out so it can run outside a browser.
const App: FC = () => <RouterProvider router={router} />;

export default App;

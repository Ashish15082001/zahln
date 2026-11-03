import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initI18n } from "@zahln/i18n/setup";
import { isWebViewTooOld } from "@zahln/native/webViewCheck";
import App from "./app/App";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("#root is missing from index.html");

// index.html's check found a WebView too old for the app's styles and shows
// what to update in #root. Starting the app would draw over that page, in
// colours the WebView can't show.
if (!isWebViewTooOld(document)) {
  initI18n();

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

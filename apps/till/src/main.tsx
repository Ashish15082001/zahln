import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initI18n } from "@zahln/i18n/setup";
import App from "./app/App";
import "./index.css";

initI18n();

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("#root is missing from index.html");

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

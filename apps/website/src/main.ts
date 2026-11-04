import { StrictMode, createElement } from "react";
import { createRoot } from "react-dom/client";

import { App } from "#root/App.js";
// oxlint-disable-next-line import/no-unassigned-import -- it's just a global css file
import "#root/main.css";

const container = document.querySelector("#root");
if (!container) {
  throw new Error("Root element #root not found");
}

createRoot(container).render(
  createElement(StrictMode, undefined, createElement(App)),
);

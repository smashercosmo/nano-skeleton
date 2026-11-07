import type { ContextRequestEvent } from "#root/context-request-event.js";

/** Internal only: the element types are declared in index.ts, which ships */
declare global {
  interface HTMLElementEventMap {
    "context-request": ContextRequestEvent;
  }
}

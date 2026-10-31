import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // The API client already retries, with the same idempotency key and a
      // deadline per attempt. Retrying here as well would multiply them.
      retry: false,
      // TanStack Query trusts navigator.onLine, which a WebView gets wrong.
      // Requests always go out, and the client reports what really happened.
      networkMode: "always",
    },
    mutations: {
      // A mutation never retries on its own: only the client may resend, and
      // only with the same key. A payment sent twice could charge twice.
      retry: false,
      networkMode: "always",
    },
  },
});

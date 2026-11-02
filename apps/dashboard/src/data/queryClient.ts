import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // The API client already retries, with a deadline per attempt. Retrying
      // here as well would multiply them.
      retry: false,
      // TanStack Query holds requests while navigator.onLine says offline,
      // which a laptop behind a VPN or a captive portal can get wrong.
      // Requests always go out, and the client reports what really happened.
      networkMode: "always",
    },
    mutations: {
      // Only the client may resend, and only with the same idempotency key.
      retry: false,
      networkMode: "always",
    },
  },
});

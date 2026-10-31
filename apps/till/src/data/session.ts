import { useMutation, useQuery } from "@tanstack/react-query";
import type { SessionRequest } from "@zahln/domain/user/backend";
import {
  toCashier,
  type Cashier,
  type Session,
} from "@zahln/domain/user/frontend";
import { createServerClock } from "../api/clock";
import { ApiError } from "../api/errors";
import { createHttp } from "../api/http";
import { postSession } from "../api/sessions";
import { config } from "../config";
import { NotACashierError } from "./loginError";
import { queryClient } from "./queryClient";

/** The session as screens see it: who is signed in, never the token. */
export type TillSession =
  { status: "signedIn"; cashier: Cashier } | { status: "signedOut" };

const sessionQueryKey = ["session"] as const;

// The token, in memory only, so a reload means logging in again. It stays out
// of the query cache, where any screen could read it.
let session: Session | null = null;
// What screens see. Kept here as well as in the cache, so the query below can
// always rebuild it.
let state: TillSession = { status: "signedOut" };

/** Saves the new state and re-renders every screen that uses useSession. */
const setState = (next: TillSession): void => {
  state = next;
  queryClient.setQueryData(sessionQueryKey, next);
};

/**
 * Forgets the token and everything fetched with it. Screens see signedOut and
 * go to the login screen.
 */
export const logOut = (): void => {
  session = null;
  // The rest of the cache belongs to this cashier, so the next one never sees
  // it. The session query stays: screens are subscribed to that very entry,
  // and a new one would never reach them.
  queryClient.removeQueries({
    predicate: (query) => query.queryKey[0] !== sessionQueryKey[0],
  });
  setState({ status: "signedOut" });
};

const signedOut = (): ApiError => new ApiError({ kind: "signedOut" });

/** Every request goes through this. It adds the token from the session. */
export const http = createHttp({
  baseUrl: config.baseUrl,
  candidateId: config.candidateId,
  appVersion: config.appVersion,
  clock: createServerClock(),
  auth: {
    getToken: () =>
      session
        ? Promise.resolve(session.accessToken)
        : Promise.reject(signedOut()),
    // No renewal yet: a refused token ends the session, and the cashier logs
    // in again. Renewing with the kept password comes in step 2b.
    renew: () => {
      logOut();
      return Promise.reject(signedOut());
    },
    markEnded: logOut,
  },
});

/** Logs in. On success every screen sees signedIn with the cashier. */
export const useLogin = () =>
  useMutation({
    mutationFn: async (credentials: SessionRequest): Promise<Cashier> => {
      const next = await postSession(http, credentials);
      const cashier = toCashier(next.user);
      // A student or finance account logs in fine, but can't use a till. The
      // token isn't kept, so nothing needs undoing.
      if (!cashier) throw new NotACashierError();

      session = next;
      setState({ status: "signedIn", cashier });
      return cashier;
    },
  });

/** Who is signed in. Re-renders whenever that changes. */
export const useSession = (): TillSession =>
  useQuery({
    queryKey: sessionQueryKey,
    // Never fetched over the network: login and logOut set it with setState.
    queryFn: () => state,
    initialData: () => state,
    // There is nothing to refetch, and dropping it would sign the cashier out.
    staleTime: Infinity,
    gcTime: Infinity,
  }).data;

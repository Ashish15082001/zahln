import { useMutation, useQuery } from "@tanstack/react-query";
import type { SessionRequest } from "@zahln/domain/user/backend";
import {
  toCashierSession,
  type Cashier,
  type CashierSession,
} from "@zahln/domain/user/frontend";
import { createServerClock } from "../api/clock";
import { ApiError } from "../api/errors";
import { createHttp } from "../api/http";
import { postSession } from "../api/sessions";
import { config } from "../config";
import { NotACashierError } from "./loginError";
import { queryClient } from "./queryClient";
import { sessionStore } from "./sessionStore";

/** The session as screens see it: who is signed in, never the token. */
export type TillSession =
  { status: "signedIn"; cashier: Cashier } | { status: "signedOut" };

const sessionQueryKey = ["session"] as const;

// Who is logged in, with their token: the one record of the login. Read from
// storage once, before the first render, so a reopen goes straight in without
// a flash of the login screen, until the token runs out.
let cashierSession: CashierSession | null = sessionStore.load();

/**
 * The part of `cashierSession` screens see. The token stays behind: the query
 * cache is open to every screen, and only http needs it.
 */
const toTillSession = (): TillSession =>
  cashierSession
    ? { status: "signedIn", cashier: cashierSession.cashier }
    : { status: "signedOut" };

/**
 * Replaces the login, in memory and in storage alike, and re-renders every
 * screen that uses useSession. The one place either changes, so they can't
 * disagree.
 */
const setCashierSession = (newCashierSession: CashierSession | null): void => {
  cashierSession = newCashierSession;
  if (newCashierSession) sessionStore.save(newCashierSession);
  else sessionStore.clear();
  queryClient.setQueryData(sessionQueryKey, toTillSession());
};

/**
 * Forgets the token, the saved login and everything fetched with it. Screens
 * see signedOut and go to the login screen.
 */
export const logOut = (): void => {
  // The rest of the cache belongs to this cashier, so the next one never sees
  // it. The session query stays: screens are subscribed to that very entry,
  // and a new one would never reach them.
  queryClient.removeQueries({
    predicate: (query) => query.queryKey[0] !== sessionQueryKey[0],
  });
  setCashierSession(null);
};

const signedOutError = (): ApiError => new ApiError({ kind: "signedOut" });

/** Every request goes through this. It adds the token from the session. */
export const http = createHttp({
  baseUrl: config.baseUrl,
  candidateId: config.candidateId,
  appVersion: config.appVersion,
  clock: createServerClock(),
  auth: {
    getToken: () =>
      cashierSession
        ? Promise.resolve(cashierSession.accessToken)
        : Promise.reject(signedOutError()),
    // No renewal yet: a refused token ends the session, and the cashier logs
    // in again. Renewing with the kept password comes in step 2b.
    renew: () => {
      logOut();
      return Promise.reject(signedOutError());
    },
    markEnded: logOut,
  },
});

/** Logs in. On success every screen sees signedIn with the cashier. */
export const useLogin = () =>
  useMutation({
    mutationFn: async (credentials: SessionRequest): Promise<Cashier> => {
      const newCashierSession = toCashierSession(
        await postSession(http, credentials),
      );
      // A student or finance account logs in fine, but can't use a till. The
      // token isn't kept, so nothing needs undoing.
      if (!newCashierSession) throw new NotACashierError();

      setCashierSession(newCashierSession);
      return newCashierSession.cashier;
    },
  });

/** Who is signed in. Re-renders whenever that changes. */
export const useSession = (): TillSession =>
  useQuery({
    queryKey: sessionQueryKey,
    // Never fetched over the network: login and logOut set it with setCashierSession.
    queryFn: toTillSession,
    initialData: toTillSession,
    // There is nothing to refetch, and dropping it would sign the cashier out.
    staleTime: Infinity,
    gcTime: Infinity,
  }).data;

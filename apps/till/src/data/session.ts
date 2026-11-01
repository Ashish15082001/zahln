import { useMutation, useQuery } from "@tanstack/react-query";
import { createServerClock } from "@zahln/api/clock";
import { createHttp } from "@zahln/api/http";
import { createSessionRenewal } from "@zahln/api/sessionRenewal";
import { postSession } from "@zahln/api/sessions";
import {
  createSessionStore,
  localKeyValueStorage,
} from "@zahln/api/sessionStore";
import type { SessionRequest } from "@zahln/domain/user/backend";
import {
  CashierSessionSchema,
  toCashierSession,
  type Cashier,
  type CashierSession,
} from "@zahln/domain/user/frontend";
import { config } from "../config";
import { NotACashierError } from "./loginError";
import { queryClient } from "./queryClient";

/** The session as screens see it: who is signed in, never the token. */
export type TillSession =
  { status: "signedIn"; cashier: Cashier } | { status: "signedOut" };

const sessionQueryKey = ["session"] as const;

/** The till's saved login, so a reopen doesn't mean logging in again. */
const sessionStore = createSessionStore<CashierSession>({
  storage: localKeyValueStorage,
  // Unchanged since the store moved to @zahln/api, so a login saved before
  // that still opens the till.
  savedSessionKey: "zahln.till.session.v1",
  sessionSchema: CashierSessionSchema,
});

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
 * Forgets the token, the saved login, the password kept for renewal and
 * everything fetched with it. Screens see signedOut and go to the login
 * screen.
 */
export const logOut = (): void => {
  sessionRenewal.forgetCredentials();
  // The rest of the cache belongs to this cashier, so the next one never sees
  // it. The session query stays: screens are subscribed to that very entry,
  // and a new one would never reach them.
  queryClient.removeQueries({
    predicate: (query) => query.queryKey[0] !== sessionQueryKey[0],
  });
  setCashierSession(null);
};

/**
 * The server's time, from the Date header of every response. The token's
 * expiry is server time, so a tablet whose clock is off renews on time.
 */
const serverClock = createServerClock();

/**
 * Logs in again shortly before the token runs out and when the server
 * refuses it, so a shift isn't cut into 5-minute logins and a refused token
 * never closes an open QR. The password from this run's login is kept in
 * memory only: after a reopen there is none, and a refused token logs out.
 */
const sessionRenewal = createSessionRenewal<CashierSession>({
  getSession: () => cashierSession,
  setSession: setCashierSession,
  endSession: logOut,
  // Null for an account that can't use a till any more, which ends the
  // session.
  logIn: async (credentials) =>
    toCashierSession(await postSession(http, credentials)),
  clock: serverClock,
});

/** Every request goes through this. It adds the token, renewed as needed. */
export const http = createHttp({
  baseUrl: config.baseUrl,
  candidateId: config.candidateId,
  appVersion: config.appVersion,
  clock: serverClock,
  auth: sessionRenewal.auth,
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

      // Before any screen can send a request, so every one can be renewed.
      sessionRenewal.keepCredentials(credentials);
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

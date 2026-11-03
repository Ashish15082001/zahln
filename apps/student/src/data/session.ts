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
  PayerSessionSchema,
  toPayerSession,
  type Payer,
  type PayerSession,
} from "@zahln/domain/user/frontend";
import { config } from "../config";
import { NotAPayerError } from "./loginError";
import { payIntentStore } from "./payIntent";
import { queryClient } from "./queryClient";

/** The session as screens see it: who is signed in, never the token. */
export type AppSession =
  { status: "signedIn"; payer: Payer } | { status: "signedOut" };

const appSessionQueryKey = ["appSession"] as const;

/** The student app's saved login, so a reopen doesn't mean logging in again. */
const payerSessionStore = createSessionStore<PayerSession>({
  storage: localKeyValueStorage,
  savedSessionKey: "zahln.app.session.v1",
  sessionSchema: PayerSessionSchema,
});

// Who is logged in, with their token: the one record of the login. Read from
// storage once, before the first render, so a reopen goes straight in without
// a flash of the login screen, until the token runs out.
let payerSession: PayerSession | null = payerSessionStore.load();

/**
 * The part of `payerSession` screens see. The token stays behind: the query
 * cache is open to every screen, and only http needs it.
 */
const toAppSession = (): AppSession =>
  payerSession
    ? { status: "signedIn", payer: payerSession.payer }
    : { status: "signedOut" };

/**
 * Replaces the login, in memory and in storage alike, and re-renders every
 * screen that uses useAppSession. The one place either changes, so they can't
 * disagree.
 */
const setPayerSession = (newPayerSession: PayerSession | null): void => {
  payerSession = newPayerSession;

  if (newPayerSession) payerSessionStore.save(newPayerSession);
  else payerSessionStore.clear();

  queryClient.setQueryData(appSessionQueryKey, toAppSession());
};

/**
 * Forgets the token, the saved login, the password kept for renewal, the pay
 * key and everything fetched with it. Screens see signedOut and go to the
 * login screen.
 */
export const logOut = (): void => {
  payerSessionRenewal.forgetCredentials();
  // The key skips the payer check, so the next payer on this phone must not
  // inherit it. The server refuses their new key while this payment is
  // pending or paid, so nothing is paid twice.
  payIntentStore.forgetIntent();
  // The rest of the cache belongs to this payer, so the next one never sees
  // it. The session query stays: screens are subscribed to that very entry,
  // and a new one would never reach them. So does what every payer shares,
  // such as the server's config, marked so by its query.
  queryClient.removeQueries({
    predicate: (query) =>
      query.queryKey[0] !== appSessionQueryKey[0] &&
      query.meta?.isSharedByPayers !== true,
  });
  setPayerSession(null);
};

/**
 * The server's time, from the Date header of every response. An order's
 * countdown runs on it, so a phone whose clock is off doesn't end it early.
 */
export const serverClock = createServerClock();

/**
 * Logs in again shortly before the token runs out and when the server
 * refuses it, so a payment never stops halfway at the login screen. The
 * password from this run's login is kept in memory only: after a reopen
 * there is none, and a refused token logs out.
 */
const payerSessionRenewal = createSessionRenewal<PayerSession>({
  getSession: () => payerSession,
  setSession: setPayerSession,
  endSession: logOut,
  // Null for an account that can't pay any more, which ends the session.
  logIn: async (credentials) =>
    toPayerSession(await postSession(http, credentials)),
  clock: serverClock,
});

/** Every request goes through this. It adds the token, renewed as needed. */
export const http = createHttp({
  baseUrl: config.baseUrl,
  candidateId: config.candidateId,
  appVersion: config.appVersion,
  clock: serverClock,
  auth: payerSessionRenewal.auth,
});

/** Logs in. On success every screen sees signedIn with the payer. */
export const useLogin = () =>
  useMutation({
    mutationFn: async (credentials: SessionRequest): Promise<Payer> => {
      const newPayerSession = toPayerSession(
        await postSession(http, credentials),
      );
      // A cashier or finance account logs in fine, but can't pay. The token
      // isn't kept, so nothing needs undoing.
      if (!newPayerSession) throw new NotAPayerError();

      // Before any screen can send a request, so every one can be renewed.
      payerSessionRenewal.keepCredentials(credentials);
      setPayerSession(newPayerSession);
      return newPayerSession.payer;
    },
  });

/** Who is signed in. Re-renders whenever that changes. */
export const useAppSession = (): AppSession =>
  useQuery({
    queryKey: appSessionQueryKey,
    // Never fetched over the network: login and logOut set it with setPayerSession.
    queryFn: toAppSession,
    initialData: toAppSession,
    // There is nothing to refetch, and dropping it would sign the payer out.
    staleTime: Infinity,
    gcTime: Infinity,
  }).data;

import { useMutation, useQuery } from "@tanstack/react-query";
import { createServerClock } from "@zahln/api/clock";
import { ApiError } from "@zahln/api/errors";
import { createHttp } from "@zahln/api/http";
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
import { queryClient } from "./queryClient";

/** The session as screens see it: who is signed in, never the token. */
export type StudentAppSession =
  { status: "signedIn"; payer: Payer } | { status: "signedOut" };

const sessionQueryKey = ["session"] as const;

/** The student app's saved login, so a reopen doesn't mean logging in again. */
const sessionStore = createSessionStore<PayerSession>({
  storage: localKeyValueStorage,
  savedSessionKey: "zahln.student.session.v1",
  sessionSchema: PayerSessionSchema,
});

// Who is logged in, with their token: the one record of the login. Read from
// storage once, before the first render, so a reopen goes straight in without
// a flash of the login screen, until the token runs out.
let payerSession: PayerSession | null = sessionStore.load();

/**
 * The part of `payerSession` screens see. The token stays behind: the query
 * cache is open to every screen, and only http needs it.
 */
const toStudentAppSession = (): StudentAppSession =>
  payerSession
    ? { status: "signedIn", payer: payerSession.payer }
    : { status: "signedOut" };

/**
 * Replaces the login, in memory and in storage alike, and re-renders every
 * screen that uses useSession. The one place either changes, so they can't
 * disagree.
 */
const setPayerSession = (newPayerSession: PayerSession | null): void => {
  payerSession = newPayerSession;
  if (newPayerSession) sessionStore.save(newPayerSession);
  else sessionStore.clear();
  queryClient.setQueryData(sessionQueryKey, toStudentAppSession());
};

/**
 * Forgets the token, the saved login and everything fetched with it. Screens
 * see signedOut and go to the login screen.
 */
export const logOut = (): void => {
  // The rest of the cache belongs to this payer, so the next one never sees
  // it. The session query stays: screens are subscribed to that very entry,
  // and a new one would never reach them.
  queryClient.removeQueries({
    predicate: (query) => query.queryKey[0] !== sessionQueryKey[0],
  });
  setPayerSession(null);
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
      payerSession
        ? Promise.resolve(payerSession.accessToken)
        : Promise.reject(signedOutError()),
    // No renewal yet: a refused token ends the session, and the payer logs in
    // again. Renewal comes with the pay screen, which must never stop halfway
    // at a login.
    renew: () => {
      logOut();
      return Promise.reject(signedOutError());
    },
    markEnded: logOut,
  },
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

      setPayerSession(newPayerSession);
      return newPayerSession.payer;
    },
  });

/** Who is signed in. Re-renders whenever that changes. */
export const useSession = (): StudentAppSession =>
  useQuery({
    queryKey: sessionQueryKey,
    // Never fetched over the network: login and logOut set it with setPayerSession.
    queryFn: toStudentAppSession,
    initialData: toStudentAppSession,
    // There is nothing to refetch, and dropping it would sign the payer out.
    staleTime: Infinity,
    gcTime: Infinity,
  }).data;

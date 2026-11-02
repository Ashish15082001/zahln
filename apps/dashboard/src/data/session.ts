import { useMutation, useQuery } from "@tanstack/react-query";
import { createServerClock } from "@zahln/api/clock";
import { createHttp } from "@zahln/api/http";
import { createSessionRenewal } from "@zahln/api/sessionRenewal";
import { postSession } from "@zahln/api/sessions";
import {
  createSessionStore,
  tabKeyValueStorage,
} from "@zahln/api/sessionStore";
import type { SessionRequest } from "@zahln/domain/user/backend";
import {
  FinanceSessionSchema,
  toFinanceSession,
  type FinanceSession,
  type FinanceUser,
} from "@zahln/domain/user/frontend";
import { config } from "../config";
import { NotAFinanceUserError } from "./loginError";
import { queryClient } from "./queryClient";

/** The session as screens see it: who is signed in, never the token. */
export type DashboardSession =
  { status: "signedIn"; financeUser: FinanceUser } | { status: "signedOut" };

const dashboardSessionQueryKey = ["dashboardSession"] as const;

/**
 * The dashboard's login, kept for this browser tab only: a reload keeps it,
 * closing the tab ends it. The password isn't kept, so after a reload the
 * login lasts until its token runs out, 5 minutes at most.
 */
const financeSessionStore = createSessionStore<FinanceSession>({
  storage: tabKeyValueStorage,
  savedSessionKey: "zahln.dashboard.session.v1",
  sessionSchema: FinanceSessionSchema,
});

// Who is logged in, with their token: the one record of the login. Read from
// storage once, before the first render, so a reload goes straight in without
// a flash of the login screen, until the token runs out.
let financeSession: FinanceSession | null = financeSessionStore.load();

/**
 * The part of `financeSession` screens see. The token stays behind: the query
 * cache is open to every screen, and only http needs it.
 */
const toDashboardSession = (): DashboardSession =>
  financeSession
    ? { status: "signedIn", financeUser: financeSession.financeUser }
    : { status: "signedOut" };

/**
 * Replaces the login, in memory and in storage alike, and re-renders every
 * screen that uses useDashboardSession. The one place either changes, so they
 * can't disagree.
 */
const setFinanceSession = (newFinanceSession: FinanceSession | null): void => {
  financeSession = newFinanceSession;

  if (newFinanceSession) financeSessionStore.save(newFinanceSession);
  else financeSessionStore.clear();

  queryClient.setQueryData(dashboardSessionQueryKey, toDashboardSession());
};

/**
 * Forgets the token, the saved login, the password kept for renewal and
 * everything fetched with it. Screens see signedOut and go to the login
 * screen.
 */
export const logOut = (): void => {
  financeSessionRenewal.forgetCredentials();
  // The rest of the cache was fetched with this login, so the next one never
  // sees it. The session query stays: screens are subscribed to that very
  // entry, and a new one would never reach them.
  queryClient.removeQueries({
    predicate: (query) => query.queryKey[0] !== dashboardSessionQueryKey[0],
  });
  setFinanceSession(null);
};

/**
 * The server's time, from the Date header of every response. The token's
 * expiry is server time, so a laptop whose clock is off renews on time.
 */
const serverClock = createServerClock();

/**
 * Logs in again shortly before the token runs out and when the server
 * refuses it, so a morning's work isn't cut into 5-minute logins. The
 * password from this tab's login is kept in memory only: after a reload
 * there is none, and a refused token logs out.
 */
const financeSessionRenewal = createSessionRenewal<FinanceSession>({
  getSession: () => financeSession,
  setSession: setFinanceSession,
  endSession: logOut,
  // Null for an account that is no longer finance, which ends the session.
  logIn: async (credentials) =>
    toFinanceSession(await postSession(http, credentials)),
  clock: serverClock,
});

/** Every request goes through this. It adds the token, renewed as needed. */
export const http = createHttp({
  baseUrl: config.baseUrl,
  candidateId: config.candidateId,
  appVersion: config.appVersion,
  clock: serverClock,
  auth: financeSessionRenewal.auth,
});

/** Logs in. On success every screen sees signedIn with the finance user. */
export const useLogin = () =>
  useMutation({
    mutationFn: async (credentials: SessionRequest): Promise<FinanceUser> => {
      const newFinanceSession = toFinanceSession(
        await postSession(http, credentials),
      );
      // A payer or cashier account logs in fine, but would see only its own
      // payments. The token isn't kept, so nothing needs undoing.
      if (!newFinanceSession) throw new NotAFinanceUserError();

      // Before any screen can send a request, so every one can be renewed.
      financeSessionRenewal.keepCredentials(credentials);
      setFinanceSession(newFinanceSession);
      return newFinanceSession.financeUser;
    },
  });

/** Who is signed in. Re-renders whenever that changes. */
export const useDashboardSession = (): DashboardSession =>
  useQuery({
    queryKey: dashboardSessionQueryKey,
    // Never fetched over the network: login and logOut set it with
    // setFinanceSession.
    queryFn: toDashboardSession,
    initialData: toDashboardSession,
    // There is nothing to refetch, and dropping it would sign the user out.
    staleTime: Infinity,
    gcTime: Infinity,
  }).data;

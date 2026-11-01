import type { SessionRequest } from "@zahln/domain/user/backend";
import type { ServerClock } from "./clock";
import { ApiError, hasProblemCode } from "./errors";
import type { Auth } from "./http";

/** What renewal needs from an app's login, whatever else the app keeps in it. */
interface RenewableSession {
  accessToken: string;
  expiresAtMs: number;
}

/** Settings for `createSessionRenewal`. */
export interface SessionRenewalConfig<TSession extends RenewableSession> {
  /** The login requests are sent with, or null when signed out. */
  getSession: () => TSession | null;
  /** Keeps a renewed login in place of the old one, in memory and storage. */
  setSession: (renewedSession: TSession) => void;
  /** Ends the login, so the user sees the login screen. */
  endSession: () => void;
  /**
   * Logs in with the kept username and password. Null when the user can't
   * use the app any more, e.g. a payer whose account became a cashier's.
   */
  logIn: (credentials: SessionRequest) => Promise<TSession | null>;
  /** The token's expiry is server time. */
  clock: ServerClock;
  /** How long before the token ends a new one is fetched. Defaults to 30 s. */
  renewMarginMs?: number;
}

/** What `createSessionRenewal` gives back. */
export interface SessionRenewal {
  /** For `createHttp`: tokens, renewed before they end and after a refusal. */
  auth: Auth;
  /**
   * Keeps the username and password of a login that just succeeded, in
   * memory only, to log in again with when the token ends.
   */
  keepCredentials: (credentials: SessionRequest) => void;
  /** Forgets them, on log out. */
  forgetCredentials: () => void;
}

const DEFAULT_RENEW_MARGIN_MS = 30_000;

const signedOutError = (): ApiError => new ApiError({ kind: "signedOut" });

/**
 * Keeps a login going past its 5-minute token. The API has no refresh token,
 * so a new token means logging in again with the password. The password is
 * kept in memory only, never on the device: after a reopen there is none
 * until the next login, and a refused token then ends the session.
 */
export const createSessionRenewal = <TSession extends RenewableSession>(
  config: SessionRenewalConfig<TSession>,
): SessionRenewal => {
  const {
    getSession,
    setSession,
    endSession,
    logIn,
    clock,
    renewMarginMs = DEFAULT_RENEW_MARGIN_MS,
  } = config;

  // The username and password from the last login.
  let credentials: SessionRequest | null = null;
  // The login on its way, shared by every request that needs a new token
  // meanwhile, so five refused requests log in once.
  let renewal: Promise<TSession> | null = null;

  /** There is no way to get a token any more: the user logs in again. */
  const endSessionForGood = (): void => {
    credentials = null;
    endSession();
  };

  /**
   * Logs in again and keeps the new login. Throws signedOut when the session
   * is over: no password, a wrong one (changed since), or a user the app no
   * longer accepts. Any other failure, such as no answer, is thrown as it is
   * and the session stays, so the next request tries again.
   */
  const logInAgain = async (sessionToRenew: TSession): Promise<TSession> => {
    const keptCredentials = credentials;
    if (keptCredentials === null) {
      endSessionForGood();
      throw signedOutError();
    }

    let renewedSession: TSession | null;
    try {
      renewedSession = await logIn(keptCredentials);
    } catch (error) {
      if (!hasProblemCode(error, "invalid_credentials")) throw error;
      renewedSession = null;
    }

    // The user logged out, or someone else logged in, while this login was
    // on its way. It isn't theirs to be signed back in with.
    if (getSession() !== sessionToRenew) throw signedOutError();
    if (renewedSession === null) {
      endSessionForGood();
      throw signedOutError();
    }
    setSession(renewedSession);
    return renewedSession;
  };

  /** The login on its way, or a new one. */
  const renewOnce = (sessionToRenew: TSession): Promise<TSession> => {
    renewal ??= logInAgain(sessionToRenew).finally(() => {
      renewal = null;
    });
    return renewal;
  };

  const getToken = async (): Promise<string> => {
    const session = getSession();
    if (session === null) throw signedOutError();

    const msLeft = session.expiresAtMs - clock.now();
    // Without a password there is nothing to renew with, so the token is
    // used until the server refuses it.
    if (msLeft > renewMarginMs || credentials === null) {
      return session.accessToken;
    }
    if (msLeft > 0) {
      // Still good for this request, which goes now; the new token is ready
      // for the next. A failure only means the next request tries again, and
      // one that ends the session has ended it already.
      renewOnce(session).catch(() => undefined);
      return session.accessToken;
    }
    // Already over: the server would only refuse it.
    return (await renewOnce(session)).accessToken;
  };

  const renew = async (rejectedToken: string): Promise<string> => {
    const session = getSession();
    if (session === null) throw signedOutError();
    // Another request renewed it while this one was on its way.
    if (session.accessToken !== rejectedToken) return session.accessToken;
    return (await renewOnce(session)).accessToken;
  };

  return {
    auth: { getToken, renew, markEnded: endSessionForGood },
    keepCredentials: (newCredentials) => {
      credentials = newCredentials;
    },
    forgetCredentials: () => {
      credentials = null;
    },
  };
};

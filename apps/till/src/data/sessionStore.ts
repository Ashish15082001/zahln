import {
  CashierSessionSchema,
  type CashierSession,
} from "@zahln/domain/user/frontend";

/** Text kept under a key that outlives the app: localStorage, or a fake. */
export interface KeyValueStorage {
  get: (key: string) => string | null;
  set: (key: string, value: string) => void;
  remove: (key: string) => void;
}

/** The till's saved login, so a reopen doesn't mean logging in again. */
export interface SessionStore {
  /** The saved login, or null when there is none, or it is broken or over. */
  load: () => CashierSession | null;
  save: (cashierSession: CashierSession) => void;
  clear: () => void;
}

// The version is in the key: a later shape gets a new key, and a login saved
// by an older app is never read as the new shape.
const savedSessionKey = "zahln.till.session.v1";

/**
 * Makes a store over `storage`. Every failure counts as no saved login: the
 * worst that can happen is one more login, never a crash at startup.
 *
 * `deviceNow` is the device clock. There is no server time yet at startup, and
 * a wrong device clock only costs one refused request.
 */
export const createSessionStore = (
  storage: KeyValueStorage,
  deviceNow: () => number = Date.now,
): SessionStore => {
  const clear = (): void => {
    try {
      storage.remove(savedSessionKey);
    } catch {
      // Storage that can't be written can't hand out the login either.
    }
  };

  /** What is saved, checked against the schema, whether it is over or not. */
  const readSavedSession = (): CashierSession | null => {
    try {
      const savedText = storage.get(savedSessionKey);
      if (savedText === null) return null;
      const parseResult = CashierSessionSchema.safeParse(JSON.parse(savedText));
      return parseResult.success ? parseResult.data : null;
    } catch {
      // Storage the WebView won't open, or text that isn't JSON.
      return null;
    }
  };

  return {
    load: () => {
      const savedSession = readSavedSession();
      if (savedSession && savedSession.expiresAtMs > deviceNow()) {
        return savedSession;
      }
      // A login that is over or broken is no use, and a token shouldn't sit
      // on the device for nothing.
      clear();
      return null;
    },
    save: (cashierSession) => {
      try {
        storage.set(savedSessionKey, JSON.stringify(cashierSession));
      } catch {
        // Full or blocked storage: the login still works until the app
        // closes, it just isn't kept.
      }
    },
    clear,
  };
};

/** The app's store, kept in the WebView's localStorage. */
export const sessionStore = createSessionStore({
  get: (key) => localStorage.getItem(key),
  set: (key, value) => localStorage.setItem(key, value),
  remove: (key) => localStorage.removeItem(key),
});

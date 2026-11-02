import type { z } from "zod";

/** Text kept under a key that outlives the app: localStorage, or a fake. */
export interface KeyValueStorage {
  get: (key: string) => string | null;
  set: (key: string, value: string) => void;
  remove: (key: string) => void;
}

/** What a saved login needs, whatever else an app keeps in it. */
interface ExpiringSession {
  expiresAtMs: number;
}

/** An app's saved login, so a reopen doesn't mean logging in again. */
export interface SessionStore<TSession extends ExpiringSession> {
  /** The saved login, or null when there is none, or it is broken or over. */
  load: () => TSession | null;
  save: (session: TSession) => void;
  clear: () => void;
}

/** Settings for `createSessionStore`. */
export interface SessionStoreConfig<TSession extends ExpiringSession> {
  /** Where the login is kept. */
  storage: KeyValueStorage;
  /**
   * The key it is kept under, one per app and with a version in it, e.g.
   * `zahln.till.session.v1`. A later shape gets a new key, and a login saved
   * by an older app is never read as the new shape.
   */
  savedSessionKey: string;
  /** What is read back is checked against this, so a broken save is dropped. */
  sessionSchema: z.ZodType<TSession>;
  /**
   * The device clock. There is no server time yet at startup, and a wrong
   * device clock only costs one refused request. Tests pass a fake one.
   */
  deviceNow?: () => number;
}

/**
 * Makes a store over `storage`. Every failure counts as no saved login: the
 * worst that can happen is one more login, never a crash at startup.
 */
export const createSessionStore = <TSession extends ExpiringSession>(
  config: SessionStoreConfig<TSession>,
): SessionStore<TSession> => {
  const {
    storage,
    savedSessionKey,
    sessionSchema,
    deviceNow = Date.now,
  } = config;

  const clear = (): void => {
    try {
      storage.remove(savedSessionKey);
    } catch {
      // Storage that can't be written can't hand out the login either.
    }
  };

  /** What is saved, checked against the schema, whether it is over or not. */
  const readSavedSession = (): TSession | null => {
    try {
      const savedText = storage.get(savedSessionKey);
      if (savedText === null) return null;
      const parseResult = sessionSchema.safeParse(JSON.parse(savedText));
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
    save: (session) => {
      try {
        storage.set(savedSessionKey, JSON.stringify(session));
      } catch {
        // Full or blocked storage: the login still works until the app
        // closes, it just isn't kept.
      }
    },
    clear,
  };
};

/** The WebView's localStorage, where the apps keep their saved login. */
export const localKeyValueStorage: KeyValueStorage = {
  get: (key) => localStorage.getItem(key),
  set: (key, value) => localStorage.setItem(key, value),
  remove: (key) => localStorage.removeItem(key),
};

/**
 * The browser tab's sessionStorage, where the dashboard keeps its login. It
 * outlives a reload but not the tab, so closing the tab on a shared office
 * computer leaves no token behind, which localStorage would.
 */
export const tabKeyValueStorage: KeyValueStorage = {
  get: (key) => sessionStorage.getItem(key),
  set: (key, value) => sessionStorage.setItem(key, value),
  remove: (key) => sessionStorage.removeItem(key),
};

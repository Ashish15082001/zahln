import {
  CashierSessionSchema,
  type CashierSession,
} from "@zahln/domain/user/frontend";
import { describe, expect, it } from "vitest";
import { createSessionStore, type KeyValueStorage } from "./sessionStore";

const DEVICE_NOW = Date.UTC(2026, 9, 31, 12, 0, 0);
const SAVED_SESSION_KEY = "zahln.till.session.v1";

const cashierSession: CashierSession = {
  accessToken: "token-cashier",
  expiresAtMs: DEVICE_NOW + 5 * 60_000,
  cashier: {
    id: "usr_cashier_campus_1",
    displayName: "Mensa am Campus, Kasse 1",
    tillId: "till_campus_1",
    mensaId: "mensa_campus",
  },
};

/** localStorage as a Map, with the Map open so tests can look inside. */
const createFakeStorage = () => {
  const savedTexts = new Map<string, string>();
  const storage: KeyValueStorage = {
    get: (key) => savedTexts.get(key) ?? null,
    set: (key, value) => savedTexts.set(key, value),
    remove: (key) => savedTexts.delete(key),
  };
  return { savedTexts, storage };
};

/** Storage the WebView won't open: every call throws. */
const brokenStorage: KeyValueStorage = {
  get: () => {
    throw new Error("storage unavailable");
  },
  set: () => {
    throw new Error("storage unavailable");
  },
  remove: () => {
    throw new Error("storage unavailable");
  },
};

/** The till's store over `storage`, with the device clock at `deviceNowMs`. */
const createCashierSessionStore = (
  storage: KeyValueStorage,
  deviceNowMs: number = DEVICE_NOW,
) =>
  createSessionStore<CashierSession>({
    storage,
    savedSessionKey: SAVED_SESSION_KEY,
    sessionSchema: CashierSessionSchema,
    deviceNow: () => deviceNowMs,
  });

describe("createSessionStore", () => {
  it("gives back a saved login that isn't over", () => {
    const { storage } = createFakeStorage();
    const sessionStore = createCashierSessionStore(storage);

    sessionStore.save(cashierSession);

    expect(sessionStore.load()).toEqual(cashierSession);
  });

  it("has nothing when no login was saved", () => {
    const { storage } = createFakeStorage();

    expect(createCashierSessionStore(storage).load()).toBeNull();
  });

  it("drops a login that is over, and removes it from storage", () => {
    const { savedTexts, storage } = createFakeStorage();
    const sessionStore = createCashierSessionStore(
      storage,
      cashierSession.expiresAtMs,
    );

    sessionStore.save(cashierSession);

    expect(sessionStore.load()).toBeNull();
    expect(savedTexts.has(SAVED_SESSION_KEY)).toBe(false);
  });

  it.each([
    ["text that isn't JSON", "{not json"],
    ["JSON of another shape", JSON.stringify({ accessToken: "token-only" })],
    ["an empty token", JSON.stringify({ ...cashierSession, accessToken: "" })],
  ])("drops %s, and removes it from storage", (_, savedText) => {
    const { savedTexts, storage } = createFakeStorage();
    savedTexts.set(SAVED_SESSION_KEY, savedText);

    expect(createCashierSessionStore(storage).load()).toBeNull();
    expect(savedTexts.has(SAVED_SESSION_KEY)).toBe(false);
  });

  it("forgets the login on clear", () => {
    const { storage } = createFakeStorage();
    const sessionStore = createCashierSessionStore(storage);

    sessionStore.save(cashierSession);
    sessionStore.clear();

    expect(sessionStore.load()).toBeNull();
  });

  it("keeps each app's login under its own key", () => {
    const { savedTexts, storage } = createFakeStorage();
    savedTexts.set("zahln.student.session.v1", JSON.stringify(cashierSession));

    expect(createCashierSessionStore(storage).load()).toBeNull();
  });

  it("never throws when storage can't be used", () => {
    const sessionStore = createCashierSessionStore(brokenStorage);

    expect(() => sessionStore.save(cashierSession)).not.toThrow();
    expect(() => sessionStore.clear()).not.toThrow();
    expect(sessionStore.load()).toBeNull();
  });
});

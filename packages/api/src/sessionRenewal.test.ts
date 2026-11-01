import type { SessionRequest } from "@zahln/domain/user/backend";
import { toPayerSession, type PayerSession } from "@zahln/domain/user/frontend";
import { describe, expect, it, vi } from "vitest";
import { createServerClock, type ServerClock } from "./clock";
import { ApiError } from "./errors";
import { createHttp } from "./http";
import { payOrder } from "./payments";
import { postSession } from "./sessions";
import { createSessionRenewal } from "./sessionRenewal";
import {
  createFakeServer,
  describeCalls,
  jsonReply,
  problemReply,
} from "./testing/fakeServer";

const SERVER_NOW = Date.UTC(2026, 10, 1, 12, 0, 0);
const CREDENTIALS: SessionRequest = {
  username: "student",
  password: "test1234",
};
const FIVE_MINUTES_MS = 5 * 60_000;

/** Server time stands still at SERVER_NOW. */
const fixedClock: ServerClock = {
  now: () => SERVER_NOW,
  observe: () => undefined,
};

interface TestSession {
  accessToken: string;
  expiresAtMs: number;
}

/** A login whose token ends `msLeft` after SERVER_NOW. */
const sessionWith = (accessToken: string, msLeft: number): TestSession => ({
  accessToken,
  expiresAtMs: SERVER_NOW + msLeft,
});

/** A promise the test settles by hand, to hold a login on its way. */
const createDeferred = <T>() => {
  let resolve: (value: T) => void = () => undefined;
  let reject: (reason: unknown) => void = () => undefined;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
};

const noResponseError = (): ApiError =>
  new ApiError({ kind: "noResponse", reason: "network" });

const wrongPasswordError = (): ApiError =>
  new ApiError({
    kind: "problem",
    status: 401,
    problem: {
      code: "invalid_credentials",
      title: "invalid_credentials",
      status: 401,
      retryable: false,
    },
  });

/** Which kind of failure `promise` rejected with. */
const failureOf = async (promise: Promise<unknown>) => {
  const error: unknown = await promise.catch((reason: unknown) => reason);
  expect(error).toBeInstanceOf(ApiError);
  return (error as ApiError).failure;
};

/**
 * An app with one login in memory, token t1 with `msLeft` to go, and a login
 * that gives back t2 unless the test says otherwise.
 */
const setup = ({
  msLeft = FIVE_MINUTES_MS,
  hasCredentials = true,
  logIn = (): Promise<TestSession | null> =>
    Promise.resolve(sessionWith("t2", FIVE_MINUTES_MS)),
}: {
  msLeft?: number;
  hasCredentials?: boolean;
  logIn?: (credentials: SessionRequest) => Promise<TestSession | null>;
} = {}) => {
  let session: TestSession | null = sessionWith("t1", msLeft);
  const logInSpy = vi.fn(logIn);
  const endSession = vi.fn(() => {
    session = null;
  });
  const sessionRenewal = createSessionRenewal<TestSession>({
    getSession: () => session,
    setSession: (renewedSession) => {
      session = renewedSession;
    },
    endSession,
    logIn: logInSpy,
    clock: fixedClock,
  });
  if (hasCredentials) sessionRenewal.keepCredentials(CREDENTIALS);

  return {
    auth: sessionRenewal.auth,
    sessionRenewal,
    logIn: logInSpy,
    endSession,
    getSession: () => session,
    /** The user logs out: what the app's logOut does to the login. */
    logOut: () => {
      session = null;
      sessionRenewal.forgetCredentials();
    },
  };
};

describe("getToken", () => {
  it("gives the token without logging in while more than 30 s are left", async () => {
    const { auth, logIn } = setup({ msLeft: 31_000 });

    await expect(auth.getToken()).resolves.toBe("t1");
    expect(logIn).not.toHaveBeenCalled();
  });

  it("with 30 s or less left, gives the token at once and logs in for the next request", async () => {
    const pendingLogIn = createDeferred<TestSession | null>();
    const { auth, logIn, getSession } = setup({
      msLeft: 30_000,
      logIn: () => pendingLogIn.promise,
    });

    await expect(auth.getToken()).resolves.toBe("t1");
    await expect(auth.getToken()).resolves.toBe("t1");
    expect(logIn).toHaveBeenCalledTimes(1);
    expect(logIn).toHaveBeenCalledWith(CREDENTIALS);

    pendingLogIn.resolve(sessionWith("t2", FIVE_MINUTES_MS));
    await vi.waitFor(() => expect(getSession()?.accessToken).toBe("t2"));
    await expect(auth.getToken()).resolves.toBe("t2");
  });

  it("keeps the token when logging in early gets no answer, and tries again on the next request", async () => {
    const { auth, logIn, endSession } = setup({
      msLeft: 20_000,
      logIn: () => Promise.reject(noResponseError()),
    });

    await expect(auth.getToken()).resolves.toBe("t1");
    await vi.waitFor(() => expect(logIn).toHaveBeenCalledTimes(1));
    await expect(auth.getToken()).resolves.toBe("t1");
    await vi.waitFor(() => expect(logIn).toHaveBeenCalledTimes(2));
    expect(endSession).not.toHaveBeenCalled();
  });

  it("waits for a new token when the old one is already over", async () => {
    const { auth, logIn } = setup({ msLeft: 0 });

    await expect(auth.getToken()).resolves.toBe("t2");
    expect(logIn).toHaveBeenCalledTimes(1);
  });

  it("without a kept password, sends the token until the server refuses it", async () => {
    const { auth, logIn, endSession } = setup({
      msLeft: 0,
      hasCredentials: false,
    });

    await expect(auth.getToken()).resolves.toBe("t1");
    expect(logIn).not.toHaveBeenCalled();
    expect(endSession).not.toHaveBeenCalled();
  });

  it("reports signedOut when there is no login", async () => {
    const { auth, logOut } = setup();
    logOut();

    expect(await failureOf(auth.getToken())).toEqual({ kind: "signedOut" });
  });
});

describe("renew after a refused token", () => {
  it("logs in again with the kept password and keeps the new token", async () => {
    const { auth, logIn, getSession } = setup();

    await expect(auth.renew("t1")).resolves.toBe("t2");
    expect(logIn).toHaveBeenCalledWith(CREDENTIALS);
    expect(getSession()?.accessToken).toBe("t2");
  });

  it("logs in once for requests refused at the same time", async () => {
    const pendingLogIn = createDeferred<TestSession | null>();
    const { auth, logIn } = setup({ logIn: () => pendingLogIn.promise });

    const renewals = [auth.renew("t1"), auth.renew("t1"), auth.renew("t1")];
    pendingLogIn.resolve(sessionWith("t2", FIVE_MINUTES_MS));

    await expect(Promise.all(renewals)).resolves.toEqual(["t2", "t2", "t2"]);
    expect(logIn).toHaveBeenCalledTimes(1);
  });

  it("gives the newer token without logging in when another request renewed it already", async () => {
    const { auth, logIn } = setup();
    await auth.renew("t1");

    await expect(auth.renew("t1")).resolves.toBe("t2");
    expect(logIn).toHaveBeenCalledTimes(1);
  });

  it("ends the session when the password was changed", async () => {
    const { auth, logIn, endSession } = setup({
      logIn: () => Promise.reject(wrongPasswordError()),
    });

    expect(await failureOf(auth.renew("t1"))).toEqual({ kind: "signedOut" });
    expect(endSession).toHaveBeenCalledTimes(1);
    expect(logIn).toHaveBeenCalledTimes(1);
  });

  it("ends the session when the app no longer accepts the user", async () => {
    const { auth, endSession } = setup({ logIn: () => Promise.resolve(null) });

    expect(await failureOf(auth.renew("t1"))).toEqual({ kind: "signedOut" });
    expect(endSession).toHaveBeenCalledTimes(1);
  });

  it("ends the session when no password was kept, as after a reopen", async () => {
    const { auth, logIn, endSession } = setup({ hasCredentials: false });

    expect(await failureOf(auth.renew("t1"))).toEqual({ kind: "signedOut" });
    expect(endSession).toHaveBeenCalledTimes(1);
    expect(logIn).not.toHaveBeenCalled();
  });

  it("keeps the session when logging in gets no answer, and tries again next time", async () => {
    let logInCount = 0;
    const { auth, endSession, getSession } = setup({
      logIn: () => {
        logInCount += 1;
        return logInCount === 1
          ? Promise.reject(noResponseError())
          : Promise.resolve(sessionWith("t2", FIVE_MINUTES_MS));
      },
    });

    expect(await failureOf(auth.renew("t1"))).toEqual({
      kind: "noResponse",
      reason: "network",
    });
    expect(endSession).not.toHaveBeenCalled();
    expect(getSession()?.accessToken).toBe("t1");

    await expect(auth.renew("t1")).resolves.toBe("t2");
  });

  it("doesn't sign the user back in when they logged out while it was logging in", async () => {
    const pendingLogIn = createDeferred<TestSession | null>();
    const { auth, logOut, getSession } = setup({
      logIn: () => pendingLogIn.promise,
    });

    const renewal = auth.renew("t1");
    logOut();
    pendingLogIn.resolve(sessionWith("t2", FIVE_MINUTES_MS));

    expect(await failureOf(renewal)).toEqual({ kind: "signedOut" });
    expect(getSession()).toBeNull();
  });
});

describe("markEnded", () => {
  it("ends the session and forgets the password", async () => {
    const { auth, logIn, endSession } = setup();

    auth.markEnded();

    expect(endSession).toHaveBeenCalledTimes(1);
    expect(await failureOf(auth.renew("t1"))).toEqual({ kind: "signedOut" });
    expect(logIn).not.toHaveBeenCalled();
  });
});

describe("a payment whose token ends on the way", () => {
  /** The user in a login reply, as the real server sends it. */
  const student = {
    id: "usr_student",
    displayName: "Test Student",
    role: "student",
    priceGroup: "student",
    tillId: null,
    mensaId: null,
  };

  /** A payment as the real server sends it back. */
  const payment = {
    id: "pay_b363fa8001a7cbd1",
    orderId: "ord_f494ab66c7ee64d4",
    status: "pending",
    amountCents: 410,
    currency: "EUR",
    priceGroup: "student",
    mensa: { id: "mensa_nord", name: "Mensa Nord" },
    till: { id: "till_nord_1", name: "Kasse 1" },
    payer: { id: "usr_student", displayName: "Test Student" },
    items: [
      {
        itemId: "item_nord_meat",
        name: { de: "Tagesgericht mit Fleisch", en: "Meat dish of the day" },
        quantity: 1,
        unitPriceCents: 410,
      },
    ],
    refundedAmountCents: 0,
    pendingRefundAmountCents: 0,
    refundableAmountCents: 410,
    needsAttention: false,
    attentionReasons: [],
    createdAt: "2026-11-01T12:00:00.000Z",
    updatedAt: "2026-11-01T12:00:00.000Z",
    version: 1,
  };

  it("logs in again and sends it once more with the same key", async () => {
    let paymentCount = 0;
    const server = createFakeServer((call) => {
      if (call.path === "/sessions") {
        return jsonReply(201, {
          accessToken: "t2",
          tokenType: "Bearer",
          expiresAt: "2026-11-01T12:05:00Z",
          user: student,
        });
      }
      paymentCount += 1;
      return paymentCount === 1
        ? problemReply(401, "session_expired", false)
        : jsonReply(201, payment);
    });

    let payerSession: PayerSession | null = {
      accessToken: "t1",
      expiresAtMs: SERVER_NOW + FIVE_MINUTES_MS,
      payer: {
        id: "usr_student",
        displayName: "Test Student",
        priceGroup: "student",
      },
    };
    const sessionRenewal = createSessionRenewal<PayerSession>({
      getSession: () => payerSession,
      setSession: (renewedSession) => {
        payerSession = renewedSession;
      },
      endSession: () => {
        payerSession = null;
      },
      logIn: async (credentials) =>
        toPayerSession(await postSession(http, credentials)),
      clock: fixedClock,
    });
    const http = createHttp({
      baseUrl: "https://api.test",
      candidateId: "c_test",
      appVersion: "1.0.0",
      clock: createServerClock(() => SERVER_NOW),
      auth: sessionRenewal.auth,
      fetch: server.fetch,
      sleep: () => Promise.resolve(),
    });
    sessionRenewal.keepCredentials(CREDENTIALS);

    const paid = await payOrder(
      http,
      payment.orderId,
      { amountCents: 410 },
      "pay-key-1",
    );

    expect(paid.id).toBe(payment.id);
    expect(describeCalls(server.calls)).toEqual([
      `POST /orders/${payment.orderId}/payments`,
      "POST /sessions",
      `POST /orders/${payment.orderId}/payments`,
    ]);
    const [firstTry, logIn, secondTry] = server.calls;
    expect(firstTry?.headers.get("Authorization")).toBe("Bearer t1");
    expect(logIn?.body).toEqual(CREDENTIALS);
    expect(secondTry?.headers.get("Authorization")).toBe("Bearer t2");
    expect(secondTry?.headers.get("Idempotency-Key")).toBe("pay-key-1");
    expect(firstTry?.headers.get("Idempotency-Key")).toBe("pay-key-1");
    expect(secondTry?.body).toEqual(firstTry?.body);
    expect(payerSession?.accessToken).toBe("t2");
  });
});

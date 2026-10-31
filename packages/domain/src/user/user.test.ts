import { describe, expect, it } from "vitest";
import { SessionRequestSchema, SessionResponseSchema } from "./backend";
import { toCashier, toCashierSession, toSession, type User } from "./frontend";

// Real POST /sessions responses from the dev server, token replaced.
const cashierLogin = {
  accessToken: "token-cashier",
  tokenType: "Bearer",
  expiresAt: "2026-10-30T19:14:57.252Z",
  user: {
    id: "usr_cashier_campus_1",
    displayName: "Mensa am Campus, Kasse 1",
    role: "cashier",
    priceGroup: null,
    tillId: "till_campus_1",
    mensaId: "mensa_campus",
  },
};

const studentLogin = {
  accessToken: "token-student",
  tokenType: "Bearer",
  expiresAt: "2026-10-30T19:14:58.102Z",
  user: {
    id: "usr_student",
    displayName: "Test Student",
    role: "student",
    priceGroup: "student",
    tillId: null,
    mensaId: null,
  },
};

const cashierUser: User = {
  id: "usr_cashier_campus_1",
  displayName: "Mensa am Campus, Kasse 1",
  role: "cashier",
  priceGroup: null,
  tillId: "till_campus_1",
  mensaId: "mensa_campus",
};

describe("SessionRequestSchema", () => {
  it("accepts a username and password", () => {
    const credentials = { username: "cashier-campus-1", password: "test1234" };

    expect(SessionRequestSchema.parse(credentials)).toEqual(credentials);
  });

  it("refuses an empty username or password", () => {
    expect(
      SessionRequestSchema.safeParse({ username: "", password: "test1234" })
        .success,
    ).toBe(false);
    expect(
      SessionRequestSchema.safeParse({ username: "cashier", password: "" })
        .success,
    ).toBe(false);
  });
});

describe("SessionResponseSchema", () => {
  it("parses a cashier's and a student's login", () => {
    expect(SessionResponseSchema.safeParse(cashierLogin).success).toBe(true);
    expect(SessionResponseSchema.safeParse(studentLogin).success).toBe(true);
  });

  it("accepts a user without the optional fields", () => {
    const parsed = SessionResponseSchema.safeParse({
      ...studentLogin,
      user: { id: "usr_student", displayName: "Test Student", role: "guest" },
    });

    expect(parsed.success).toBe(true);
  });

  it("refuses a login without a token", () => {
    const parsed = SessionResponseSchema.safeParse({
      tokenType: "Bearer",
      expiresAt: cashierLogin.expiresAt,
      user: cashierLogin.user,
    });

    expect(parsed.success).toBe(false);
  });

  it("refuses an expiry that isn't a date-time", () => {
    const parsed = SessionResponseSchema.safeParse({
      ...cashierLogin,
      expiresAt: "in 5 minutes",
    });

    expect(parsed.success).toBe(false);
  });

  it("refuses a role the spec doesn't list", () => {
    const parsed = SessionResponseSchema.safeParse({
      ...cashierLogin,
      user: { ...cashierLogin.user, role: "admin" },
    });

    expect(parsed.success).toBe(false);
  });

  it("drops keys it doesn't know", () => {
    const parsed = SessionResponseSchema.parse({
      ...cashierLogin,
      refreshToken: "not in the spec",
    });

    expect(parsed).not.toHaveProperty("refreshToken");
  });
});

describe("toSession", () => {
  it("turns the expiry into milliseconds and a missing field into null", () => {
    const session = toSession(
      SessionResponseSchema.parse({
        ...studentLogin,
        user: {
          id: "usr_student",
          displayName: "Test Student",
          role: "student",
          priceGroup: "student",
        },
      }),
    );

    expect(session.expiresAtMs).toBe(Date.UTC(2026, 9, 30, 19, 14, 58, 102));
    expect(session.user.tillId).toBeNull();
    expect(session.user.mensaId).toBeNull();
  });
});

describe("toCashier", () => {
  it("accepts a cashier with a till", () => {
    expect(toCashier(cashierUser)).toEqual({
      id: "usr_cashier_campus_1",
      displayName: "Mensa am Campus, Kasse 1",
      tillId: "till_campus_1",
      mensaId: "mensa_campus",
    });
  });

  it("refuses anyone who isn't a cashier", () => {
    expect(toCashier({ ...cashierUser, role: "student" })).toBeNull();
    expect(toCashier({ ...cashierUser, role: "finance" })).toBeNull();
  });

  it("refuses a cashier without a till or a mensa", () => {
    expect(toCashier({ ...cashierUser, tillId: null })).toBeNull();
    expect(toCashier({ ...cashierUser, mensaId: null })).toBeNull();
  });
});

describe("toCashierSession", () => {
  it("keeps the token, its expiry and the cashier", () => {
    const session = toSession(SessionResponseSchema.parse(cashierLogin));

    expect(toCashierSession(session)).toEqual({
      accessToken: "token-cashier",
      expiresAtMs: Date.UTC(2026, 9, 30, 19, 14, 57, 252),
      cashier: {
        id: "usr_cashier_campus_1",
        displayName: "Mensa am Campus, Kasse 1",
        tillId: "till_campus_1",
        mensaId: "mensa_campus",
      },
    });
  });

  it("is null for a user who can't use the till", () => {
    const session = toSession(SessionResponseSchema.parse(studentLogin));

    expect(toCashierSession(session)).toBeNull();
  });
});

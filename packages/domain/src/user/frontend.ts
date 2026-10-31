import { z } from "zod";
import {
  PriceGroupResponseSchema,
  RoleResponseSchema,
  type SessionResponse,
  type UserResponse,
} from "./backend";

// ---- enums: the same values in the app as on the wire

export const PriceGroupSchema = PriceGroupResponseSchema;
export type PriceGroup = z.infer<typeof PriceGroupSchema>;

export const RoleSchema = RoleResponseSchema;
export type Role = z.infer<typeof RoleSchema>;

// ---- shapes used in the app

// Missing and null are both "not set" on the wire. In the app it is always
// null, so code checks one thing, not two.
export const UserSchema = z.object({
  id: z.string().min(1),
  displayName: z.string(),
  role: RoleSchema,
  priceGroup: PriceGroupSchema.nullable(),
  tillId: z.string().min(1).nullable(),
  mensaId: z.string().min(1).nullable(),
});

export interface User extends z.infer<typeof UserSchema> {}

// expiresAtMs is a number so the client compares it with server time without
// parsing a date on every request.
export const SessionSchema = z.object({
  accessToken: z.string().min(1),
  expiresAtMs: z.int(),
  user: UserSchema,
});

export interface Session extends z.infer<typeof SessionSchema> {}

/** A user the till accepts: a cashier who works at one till. */
export const CashierSchema = z.object({
  id: z.string().min(1),
  displayName: z.string(),
  tillId: z.string().min(1),
  mensaId: z.string().min(1),
});

export interface Cashier extends z.infer<typeof CashierSchema> {}

/**
 * A logged-in cashier and their token: all the till keeps about a login. The
 * raw user isn't kept, since Cashier already has what the till needs.
 */
export const CashierSessionSchema = z.object({
  accessToken: z.string().min(1),
  expiresAtMs: z.int(),
  cashier: CashierSchema,
});

export interface CashierSession extends z.infer<typeof CashierSessionSchema> {}

// ---- from the wire shape

export const toUser = (response: UserResponse): User => ({
  id: response.id,
  displayName: response.displayName,
  role: response.role,
  priceGroup: response.priceGroup ?? null,
  tillId: response.tillId ?? null,
  mensaId: response.mensaId ?? null,
});

export const toSession = (response: SessionResponse): Session => ({
  accessToken: response.accessToken,
  // The schema has already checked this is an ISO date-time, so it parses.
  expiresAtMs: Date.parse(response.expiresAt),
  user: toUser(response.user),
});

/**
 * The cashier the till works for, or null when the user can't use the till.
 * A cashier without a till is refused too: every order needs one.
 */
export const toCashier = (user: User): Cashier | null => {
  if (user.role !== "cashier" || !user.tillId || !user.mensaId) return null;

  return {
    id: user.id,
    displayName: user.displayName,
    tillId: user.tillId,
    mensaId: user.mensaId,
  };
};

/** The login as the till keeps it, or null when the user can't use the till. */
export const toCashierSession = (session: Session): CashierSession | null => {
  const cashier = toCashier(session.user);
  if (!cashier) return null;

  return {
    accessToken: session.accessToken,
    expiresAtMs: session.expiresAtMs,
    cashier,
  };
};

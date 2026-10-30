import { z } from "zod";

// ---- enums, shared with the payment and order shapes later

export const PriceGroupResponseSchema = z.enum(["student", "staff", "guest"]);

export const RoleResponseSchema = z.enum([
  "student",
  "staff",
  "guest",
  "cashier",
  "finance",
]);

// ---- user and session, as POST /sessions returns them

export const UserResponseSchema = z.object({
  id: z.string().min(1),
  displayName: z.string(),
  role: RoleResponseSchema,
  // The spec has these as optional and nullable. The server sends null today,
  // but a missing key is just as valid, so both are accepted.
  priceGroup: PriceGroupResponseSchema.nullish(),
  tillId: z.string().min(1).nullish(),
  mensaId: z.string().min(1).nullish(),
});

export interface UserResponse extends z.infer<typeof UserResponseSchema> {}

export const SessionResponseSchema = z.object({
  accessToken: z.string().min(1),
  // Optional in the spec. The client always sends "Authorization: Bearer", so
  // any other type should fail loudly here rather than as 401s later.
  tokenType: z.literal("Bearer").optional(),
  expiresAt: z.iso.datetime({ offset: true }),
  user: UserResponseSchema,
});

export interface SessionResponse extends z.infer<
  typeof SessionResponseSchema
> {}

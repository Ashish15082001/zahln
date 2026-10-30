import { z } from "zod";

// ---- error body (application/problem+json)

export const ProblemResponseSchema = z.object({
  // Any string, not an enum. If the server adds a code, the error body must
  // still parse: a parse failure here would hide the real error behind a
  // vague one. The codes the apps act on are typed in PROBLEM_CODES below.
  code: z.string().min(1),
  title: z.string(),
  status: z.int(),
  retryable: z.boolean(),
  detail: z.string().nullish(),
});

export interface ProblemResponse extends z.infer<
  typeof ProblemResponseSchema
> {}

// ---- codes named in the spec

export const PROBLEM_CODES = [
  "invalid_request",
  "invalid_credentials",
  "unauthorized",
  "session_expired",
  "forbidden",
  "unknown_candidate",
  "not_found",
  "order_expired",
  "order_payment_in_progress",
  "order_already_paid",
  "amount_mismatch",
  "refund_exceeds_payment",
  "idempotency_mismatch",
  "payment_not_refundable",
  "refund_window_closed",
  "app_version_unsupported",
  "connection_dropped",
  "unavailable",
  "payments_disabled",
  "timeout",
] as const;

export type ProblemCode = (typeof PROBLEM_CODES)[number];

const problemCodes: ReadonlySet<string> = new Set(PROBLEM_CODES);

export const isProblemCode = (code: string): code is ProblemCode =>
  problemCodes.has(code);

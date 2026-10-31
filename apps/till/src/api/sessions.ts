import {
  SessionResponseSchema,
  type SessionRequest,
} from "@zahln/domain/user/backend";
import { toSession, type Session } from "@zahln/domain/user/frontend";
import type { Http } from "./http";

/**
 * POST /sessions: logs in and returns the token, its expiry in milliseconds
 * and the user. Repeating a login is harmless, so it retries like a read.
 */
export const postSession = async (
  http: Http,
  credentials: SessionRequest,
): Promise<Session> => {
  const response = await http.request({
    method: "POST",
    path: "/sessions",
    body: credentials,
    schema: SessionResponseSchema,
    authenticated: false,
  });
  return toSession(response);
};

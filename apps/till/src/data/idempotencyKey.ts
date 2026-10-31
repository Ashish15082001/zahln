/**
 * A new Idempotency-Key for one intent, e.g. `order_3f9a…c21e`: 16 random
 * bytes as hex. The caller keeps it and sends it again for every retry of
 * that intent, never for a different one.
 *
 * Not crypto.randomUUID: it exists only on https, and the dev build on a
 * tablet loads over plain http on the LAN. getRandomValues works on both.
 */
export const newIdempotencyKey = (prefix: string): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return `${prefix}_${hex}`;
};

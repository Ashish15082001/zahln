# API gaps

Where the Zahln API makes something hard or impossible, what the apps do about
it for now, and what I would change. The brief asks for this, and the design
document links here. New gaps are added as the work finds them.

## 1. No way to cancel an order

- **Problem:** if a student walks away, the old QR can still be paid for 5
  minutes while the cashier rings up the next order.
- **For now:** the till warns that the old QR can still be paid, keeps
  checking the old order until it expires, and shows a notice if it gets paid.
- **I would add:** `POST /orders/{id}/cancel` for the cashier, refused once a
  payment is being checked or the order is paid.

## 2. No refresh token

- **Problem:** a token lasts 5 minutes, and the only way to get a new one is to
  log in again. So the app keeps the password in memory for the whole session.
- **For now:** the password stays in memory only, never on disk, and a restart
  asks for it again. That's fine for seeded test users, not for production.
- **I would add:** a long-lived refresh token that changes on every use and is
  kept in the Android Keystore, so the app never holds the password after
  login.

## 3. No log out

- **Problem:** there is no call that ends a session, so a token keeps working
  for up to 5 minutes after the cashier logs out.
- **For now:** the app forgets the token. The server still accepts it until it
  expires.
- **I would add:** `DELETE /sessions/current`, which ends the token on the
  server.

## 4. No way to look up an unknown refund

- **Problem:** when a refund's response is lost, resending it with the same
  key is the only way to learn whether it happened. A payment can be checked
  through its order, but a refund has nothing similar.
- **Made worse by:** idempotency keys are stored per user. If another cashier
  at the same till resends the refund, the server sees a new refund, so the
  money could go back twice.
- **For now:** only the cashier who started a refund can resend it, because
  their saved refund is encrypted with their password.
- **I would add:** the idempotency key on each refund in `GET /payments/{id}`,
  or a lookup by key. Keys for cashier actions would be stored per till rather
  than per user.

## 5. No push

- **Problem:** the till and the app can only poll for results. At lunch rush,
  every till polling every 2 seconds is a lot of requests on a campus network.
- **For now:** polling, which stops as soon as a final state arrives.
- **I would add:** server-sent events for order and payment changes, with
  polling kept as the fallback.

## 6. Unclear in the spec: an order still being paid when it expires

- **Problem:** the spec doesn't say whether an order that is `paying` at
  `expiresAt` can still become `paid`.
- **For now:** the till shows "Expired" only when the server says `expired`,
  and keeps checking until then.
- **I would add:** one sentence in the spec, for example: "An order with a
  pending payment does not expire until that payment is decided."

# API gaps

Where the Zahln API makes something hard or impossible, what the apps do about
it for now, and what I would change. The brief asks for this, and the design
document links here. New gaps are added as the work finds them.

## 1. No way to cancel an order

- **Problem:** if a student walks away, their order's QR can still be paid for
  5 minutes, and the cashier has no way to end it.
- **For now:** the QR dialog stays open until the server says the order is
  paid or expired, so the till never loses sight of a QR that can still be
  paid. The cost: when a payer walks away, the cashier waits up to 5 minutes
  before the next order.
- **I would add:** `POST /orders/{id}/cancel` for the cashier, refused once a
  payment is being checked or the order is paid. The dialog would then get a
  Cancel order button.

## 2. No refresh token

- **Problem:** a token lasts 5 minutes, and the only way to get a new one is to
  log in again, which needs the password.
- **For now:** the student app keeps the password from this run's login in
  memory, never on disk, and logs in again with it 30 seconds before the token
  ends and when the server refuses it. A payment refused with a 401 is sent
  again with the same key
  ([student-plan.md](student-plan.md#renewing-the-token)). After a reopen
  there is no password, so a refused token still logs out. The till doesn't
  renew yet: a refused token logs it out and closes an open QR dialog, so the
  cashier loses sight of an order that can still be paid.
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
- **For now:** the till has no refunds yet. The plan is that only the cashier
  who started a refund can resend it: the refund in progress is saved
  encrypted with their password, so no other cashier can open it.
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

## 7. No list of orders

- **Problem:** only `GET /orders/{orderId}` exists, so a cashier can't list
  their till's orders. Once they acknowledge the QR dialog, an order that
  expired unpaid can't be seen again.
- **For now:** the till's Payments tab lists the till's payments
  (`GET /payments`). An order that was never paid isn't in it.
- **I would add:** `GET /orders` for the cashier, scoped to their till like
  `GET /orders/{orderId}`, newest first, with a `status` filter and cursor
  paging.

## 8. No short order code

- **Problem:** the order id is the only code for an order, and it is 20
  characters, e.g. `ord_ef3781b912e20464`. A student whose phone can't scan has
  to type all of it while the queue waits.
- **For now:** the till prints the id under its QR in a monospace font, so 0
  and O look different. The student app takes it typed, with any spaces, or the
  QR's whole text pasted.
- **I would add:** a short code per open order, e.g. 6 characters without
  look-alike letters, unique among the open orders, and `GET /orders?code=` to
  look one up.

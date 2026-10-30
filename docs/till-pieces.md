# Till pieces

The till is built in 8 pieces. Each piece is one or two commits, and work stops
after each for review. The design behind them is in
[till-plan.md](till-plan.md). Pieces get their file-by-file detail before they
start.

## Status

| #   | Piece                                                                                | Done when                                                                                                                                                                       | Status  |
| --- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1   | Static screens: welcome and login, with the router. No API yet                       | **Continue** opens the login screen                                                                                                                                             | Done    |
| 2   | `packages/domain`: the data shapes                                                   | Tests pass                                                                                                                                                                      | Done    |
| 3   | `packages/api`: the client                                                           | Tests: a token expiring mid-request, three `401`s with one login, a wrong password ending the session without looping, a network error that keeps the session, an early renewal | Next    |
| 4   | `packages/storage`: saved data                                                       | Tests: A's data can't be read with B's key, a wrong password reads as empty, nothing can be read after `close()`, damaged data reads as empty                                   | Planned |
| 5   | `apps/till`: the session wired together                                              | In the dev server: logging in and out works, a wrong password shows its message, and requests still work after 5 minutes without a login screen                                 | Planned |
| 6   | Charge flow                                                                          | An order paid through the API as `student` shows "Paid", an unpaid one shows "Expired", and a killed app returns to the open order                                              | Planned |
| 7   | Refund flow                                                                          | Full and partial refunds work, each refusal shows its message, and the form locks when the outcome is unknown                                                                   | Planned |
| 8   | Finish: German strings, portrait layout, TalkBack labels, a run on a tablet emulator | All checks pass                                                                                                                                                                 | Planned |

Pieces 2 to 5 are the session and login. Their design, with diagrams, is in
[till-plan.md](till-plan.md#session-and-login).

## Piece 1: static screens (done)

| File                                                  | Contents                                                                         |
| ----------------------------------------------------- | -------------------------------------------------------------------------------- |
| `apps/till/src/app/paths.ts`, `router.tsx`, `App.tsx` | Routes `/` and `/login`. Any other path goes back to `/`                         |
| `apps/till/src/screens/welcome/`                      | "Welcome to Zahln", **Continue** (a link styled as a button) and the app version |
| `apps/till/src/screens/login/`                        | Username and password form with controlled fields. Submitting does nothing yet   |
| `packages/i18n`                                       | The screens' strings in English and German                                       |
| `packages/ui/src/styles/touch.css`                    | Buttons and fields at least 48 px tall, in the till and the student app          |

## Piece 2: `packages/domain`, the data shapes (done)

| File                 | Contents                                                                                                                          |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `user/backend.ts`    | `UserResponseSchema`, `SessionResponseSchema`, and the role and price group enums, matching the server exactly                    |
| `user/frontend.ts`   | `User` (missing and null both become null), `Session` (expiry in milliseconds), `Cashier`, and `toUser`, `toSession`, `toCashier` |
| `problem/backend.ts` | `ProblemResponseSchema`, plus `PROBLEM_CODES` (the 20 codes in the spec) and `isProblemCode`                                      |
| `mensa/backend.ts`   | `MensaListResponseSchema`: tills, menu items, names in German and English, and prices in whole cents                              |
| `package.json`       | `typecheck`, `lint` and `test` scripts, and zod                                                                                   |

**Tests (17), using real responses from the dev server:**

- Cashier and student logins parse, and so does a user without the optional
  fields.
- A login without a token, an expiry that isn't a date-time, or an unknown
  role is refused.
- Keys the spec doesn't name are dropped.
- `toSession` turns the expiry into milliseconds and a missing field into null.
- `toCashier` refuses a student, finance, and a cashier without a till or a
  mensa.
- An error body without `detail` parses, and so does an error code the spec
  doesn't list yet. A body without `retryable` is refused.
- The mensa list parses. A price that is negative or not whole cents is
  refused.

## Piece 3: `packages/api`, the client

| File                                           | Contents                                                                                                                                                |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `clock.ts`                                     | Server time = device time + the offset read from the `Date` header                                                                                      |
| `errors.ts`                                    | `ApiError` with 3 kinds: `problem` (code, status, retryable), `noResponse` (outcome unknown), `invalidResponse` (failed the zod check)                  |
| `http.ts`                                      | `request()`: headers, a 10 s deadline per attempt, up to 3 attempts with backoff, the same key on every retry, and on `401` one renewal then one resend |
| `session.ts`                                   | `login`, `getToken` (renews when under 30 s are left), `renew` (one login shared by all requests), `logout`, `getUser`, `onChange`                      |
| `endpoints/sessions.ts`, `endpoints/mensas.ts` | `POST /sessions`, `GET /mensas`                                                                                                                         |
| `client.ts`                                    | `createApiClient(config)` connects the pieces                                                                                                           |

**Tests, against a fake server and a fake clock:**

- A lost response is retried with the same key.
- `503` is retried; `400` is not.
- A request that hits the deadline is cancelled and retried.
- A token that expires mid-request causes one login and a resend with the same
  key.
- Three `401`s at once cause exactly one login.
- A wrong password during renewal ends the session, with no loop.
- A network error during renewal keeps the session.
- The token is renewed early even when the device clock is wrong.
- A malformed response gives `invalidResponse`.

## Piece 4: `packages/storage`, saved data (new package)

| File             | Contents                                                                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `crypto.ts`      | Key from the password: PBKDF2-SHA256 at 600,000 rounds (OWASP's number). AES-GCM with a fresh IV for every write                               |
| `userStorage.ts` | `openUserStorage({ app, userId, password })` gives `get(key, schema)`, `set`, `remove` and `close`. Keys are named `zahln:till:{userId}:{key}` |
| Lint rule        | `localStorage` and `indexedDB` are allowed only in this package                                                                                |
| Libraries        | `idb-keyval`, plus `fake-indexeddb` for tests                                                                                                  |

**Tests:** B's key can't read A's data, a wrong password reads as empty,
nothing can be read after `close()`, and damaged data reads as empty.

## Piece 5: `apps/till`, the session wired together

| Part                                    | Contents                                                                                                                                                                         |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data/client.ts`, `data/queryClient.ts` | One client for the app. TanStack Query set to `retry: false` and `networkMode: "always"`                                                                                         |
| `data/session.ts`                       | `useSession`, `useLogin` (log in, check it's a cashier, open storage), `useLogout`                                                                                               |
| `app/requireSession/`                   | No session: go to `/login`. Already logged in: `/` and `/login` go to `/charge`                                                                                                  |
| Login screen                            | One `status` value (`idle` / `submitting` / `error`), the button reads "Logging in…", errors in an alert TalkBack announces, and "Your session ended" when the session was ended |
| `components/header/`                    | Mensa and till names (from `GET /mensas`), the cashier's name, Log out                                                                                                           |
| `/charge`                               | Placeholder screen with the header, until piece 6                                                                                                                                |
| Lint rule                               | Screens can't import `@zahln/api` or `@zahln/storage`                                                                                                                            |
| Strings                                 | English and German                                                                                                                                                               |

**Done when** these work in the dev server:

- `cashier-campus-1` logs in and sees "Mensa am Campus · Till 1".
- A wrong password shows its message.
- `student` gets "This account can't use the till".
- Log out returns to the login screen.
- After 6 minutes, the header still loads without a login screen. That proves
  the renewal in the real app.

## Piece 6: charge flow

What the cashier sees in each situation is in
[till-plan.md](till-plan.md#charge-flow).

- **Shapes and calls:** order schemas, `POST /orders` and `GET /orders/{id}`.
- **Store:** Redux Toolkit arrives, with the `cart` and `charge` slices and
  tests for both.
- **Screens:** menu and cart on `/charge`, then the QR with a countdown in
  server time on `/charge/:orderId`, polling every 2 seconds.
- **Saved:** the open order's key and id, so a restart goes back to it. The
  menu is saved too, for a faster start.
- **Libraries:** `@reduxjs/toolkit`, `react-redux`, `qrcode.react`.

## Piece 7: refund flow

What the cashier sees in each situation is in
[till-plan.md](till-plan.md#refund-flow).

- **Shapes and calls:** payment and refund schemas, `GET /payments` (paged),
  `GET /payments/{id}` and `POST /payments/{id}/refunds`.
- **Store:** the `refund` slice, with tests.
- **Screens:** `/payments` (newest first, search by id) and
  `/payments/:paymentId` with the refund form, **Refund all** and a confirm
  dialog.
- **Saved:** the refund in progress, until its outcome is known.
- **Rule:** the form stays locked while an attempt's outcome is unknown.

## Piece 8: finish

- Every string checked in German.
- The layout in portrait as well as landscape.
- TalkBack labels, and status changes announced.
- A run on a tablet emulator.

## Choices

| Choice                                                      | Why                                                                                                                                            |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| The error `code` is checked as any string, not a fixed list | A code the server adds later still reaches the app as a readable error, instead of failing the zod check. The codes we handle are a typed list |
| Roles and price groups are a fixed list                     | They mirror the spec's enums. An unknown role fails the check loudly, rather than being treated as a role we know                              |
| The header loads mensa names in piece 5                     | The till should show where it is, and this gives one real request to prove the renewal works                                                   |
| 600,000 PBKDF2 rounds                                       | Timed on the emulator in piece 4, and lowered only if login feels slow                                                                         |

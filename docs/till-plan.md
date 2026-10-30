# Till plan

The detailed plan for steps 1 and 2 of [plan.md](plan.md): the till, and the
parts of `domain` and `api` it needs. The student app's parts follow in step 3.
The plan changes as the work does.

## What the till does

- Ring up an order from the mensa's menu and show its QR.
- Show the cashier the result once the student has paid.
- Refund a payment in full or in part, with a clear error when it isn't
  allowed.

## Architecture: three layers

| Layer                 | Folder                                  | What it holds                                                                                                                                                  |
| --------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI                    | `apps/till/src/screens/`, `components/` | Screens, each as `Foo.tsx` (container) and `FooJSX.tsx` (JSX only)                                                                                             |
| Store (Redux Toolkit) | `apps/till/src/store/`                  | The till's own state, which the server doesn't have: `cart`, `charge` (the current order's key and id), `refund` (the current refund's key, amount and status) |
| Data access           | `apps/till/src/data/`                   | TanStack Query hooks and the query client's settings                                                                                                           |
|                       | `packages/api`                          | HTTP client: deadlines, retries, keys, session, zod checks, typed errors                                                                                       |
|                       | `packages/storage`                      | Data saved on the device, kept apart and encrypted per cashier                                                                                                 |
| Shared rules          | `packages/domain`                       | zod schemas, money formatting, order and payment state helpers                                                                                                 |

Rules between the layers, enforced by lint where possible:

- Screens read the store and the data hooks. They never import `@zahln/api`.
- Only `data/` imports `@zahln/api`.
- The store holds no server data and sends no requests.
- `packages/api`, `packages/storage` and `packages/domain` don't import React.
- Only `packages/storage` uses `localStorage` or `indexedDB`.

### Query client settings

| Setting                                       | Value                                      | Why                                                                           |
| --------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------- |
| `retry`                                       | `false`                                    | Our client is the only one that retries, so retries don't multiply            |
| `networkMode`                                 | `"always"`                                 | The WebView's offline flag is unreliable. Our client handles failures         |
| `structuralSharing` on order and payment data | Keeps the old data when `version` is lower | The server can return an older state, and "paid" must never go back to "open" |
| Mutations                                     | `retry: false`, and the key is passed in   | A mutation never makes up its own key and never retries                       |

## Session and login

The session lives in the data layer, not in the store.

| Part                                     | Owner                             | Why                                                                                                                                                    |
| ---------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Token and password                       | `packages/api` client, in memory  | The server can end a token before `expiresAt`, so only a `401` says it's gone. The client then logs in again and resends, in the middle of the request |
| The logged-in cashier: name, till, mensa | TanStack Query, key `["session"]` | Screens read it like any other data. It comes from the client, not the network, so a refetch never sends a login                                       |

### Parts

```mermaid
flowchart TD
  subgraph UI["UI · apps/till/src"]
    Login["Login screen"]
    Guard["RequireSession"]
    Header["Header · Log out"]
  end
  subgraph Data["Data · apps/till/src/data/session.ts"]
    Session["session query<br/>signedIn or signedOut"]
  end
  subgraph Api["packages/api"]
    SessionTs["session.ts<br/>token and password, in memory"]
    Http["http.ts<br/>renews early, 401 → renew"]
    Clock["clock.ts<br/>server time from the Date header"]
  end
  subgraph Storage["packages/storage"]
    Saved["zahln:till:{userId}:{key}<br/>AES-GCM, key from the password<br/>IndexedDB"]
  end
  Server[("Zahln API")]

  Login -- useLogin --> Session
  Guard -- useSession --> Session
  Header -- useLogout --> Session
  Session -- "login, logout" --> SessionTs
  SessionTs -. onChange .-> Session
  Session -- "open, close" --> Saved
  Http --> SessionTs
  Http --> Clock
  SessionTs -- "POST /sessions" --> Server
  Http -- "Authorization: Bearer token" --> Server
```

| Part                               | Job                                                                                                                                          |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/api/src/session.ts`      | Holds the token, its expiry and the password in a closure. `login`, `getToken` (renews early), `renew` (one at a time), `logout`, `onChange` |
| `packages/api/src/http.ts`         | Headers, a deadline per attempt, retries on network errors. On `401` it calls `renew` and resends once with the same key                     |
| `packages/api/src/clock.ts`        | Server time from the `Date` header, so a wrong tablet clock can't cause early or late renewals                                               |
| `packages/api/src/errors.ts`       | problem+json as an `ApiError` with a typed `code`. A lost response has its own case                                                          |
| `apps/till/src/data/session.ts`    | `useSession`, `useLogin`, `useLogout`. Opens the cashier's saved data after login and closes it at log out                                   |
| `apps/till/src/app/RequireSession` | No session: go to `/login`                                                                                                                   |

### States

```ts
type SessionState =
  | { status: "signedIn"; cashier: Cashier } // name, tillId, mensaId
  | { status: "signedOut"; reason: "start" | "loggedOut" | "ended" };
```

```mermaid
stateDiagram-v2
  [*] --> signedOut
  signedOut --> signedIn: log in ok, a cashier with a till
  signedIn --> signedOut: Log out (reason loggedOut)
  signedIn --> renewing: under 30 s left, or 401
  renewing --> signedIn: new token
  renewing --> signedIn: network error, that request fails
  renewing --> signedOut: wrong password, or 401 again (reason ended)
  note right of renewing: Inside the api client only
```

`renewing` exists only inside the client. Screens see `signedIn` or
`signedOut`, so the cashier never notices a renewal. `ended` makes the login
screen say "Your session ended. Log in again."

### Logging in

- The form sends `POST /sessions`. Network errors are retried up to 3 times,
  since a login moves no money.
- zod checks the response, and the account must be a `cashier` with a till.

| Answer                        | The till shows                        |
| ----------------------------- | ------------------------------------- |
| `invalid_credentials`         | "Wrong username or password"          |
| Not a cashier                 | "This account can't use the till"     |
| 502 / 503 / 504 / no response | "Can't reach the server. Try again."  |
| `unknown_candidate`           | "This build has a wrong candidate ID" |

The form has labelled fields with `autocomplete="username"` and
`autocomplete="current-password"`. While sending, the button reads
"Logging in…". Errors appear in an alert that TalkBack announces.

### Keeping the session alive

The API has no refresh token, so renewing means logging in again with the
password kept in memory. The cashier never sees a login screen for it.

| Situation                               | What happens                                                                                                                                                             |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Under 30 s left, in server time         | Log in again before sending                                                                                                                                              |
| `401 session_expired` or `unauthorized` | Log in again, then resend once with the same key                                                                                                                         |
| Several requests get `401` at once      | One login, shared by all of them                                                                                                                                         |
| The resend gets `401` again             | Session ended                                                                                                                                                            |
| Renewal: wrong password                 | Session ended: the login screen with "Your session ended"                                                                                                                |
| Renewal: network error                  | Session kept. That request shows "Connection problem, checking…", and the next poll tries again                                                                          |
| App restarted                           | Log in again. The password is never saved                                                                                                                                |
| Log out                                 | Forget the token and password, close the saved data, clear the cache and the cart. The server accepts the token until it expires ([API gap 3](api-gaps.md#3-no-log-out)) |

### Step by step

```mermaid
sequenceDiagram
  participant UI
  participant Data as data/session
  participant Api as api client
  participant Disk as storage (IndexedDB)
  participant Server as Zahln API

  Note over UI,Server: 1. Log in
  UI->>Data: log in (username, password)
  Data->>Api: login(username, password)
  Api->>Server: POST /sessions
  Server-->>Api: 201 token, user
  Note right of Api: keeps token and password in memory
  Api-->>Data: cashier
  Data->>Disk: open(userId, password)
  Note right of Disk: makes the key
  Disk-->>Data: saved open order, if any
  Data-->>UI: signedIn
  Note over UI: /charge, or back to the open order

  Note over UI,Server: 2. Any request, e.g. the order poll
  Data->>Api: getOrder
  opt under 30 s left
    Api->>Server: POST /sessions
    Server-->>Api: 201 new token
  end
  Api->>Server: GET /orders/{id}
  Server-->>Api: 401 session_expired
  Api->>Server: POST /sessions, password from memory
  Server-->>Api: 201 new token
  Api->>Server: same request, same key
  Server-->>Api: 200 order
  Api-->>Data: order
  Note over UI: the screen never changed

  Note over UI,Server: 3. Log out
  UI->>Data: Log out
  Data->>Api: logout()
  Note right of Api: forgets token and password
  Data->>Disk: close()
  Note right of Disk: forgets the key, data stays
  Data-->>UI: signedOut
```

## Saved data on the device

Each cashier's data is kept apart and encrypted with a key made from their
password. A prefix alone keeps users apart in our code, but anyone with the
device's files could read every prefix.

| Part       | Choice                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------- |
| Package    | `packages/storage`, shared, because the student app needs it for its payment key                    |
| Where      | IndexedDB, through `idb-keyval`                                                                     |
| Namespace  | `zahln:till:{userId}:{key}`, using the server's user id                                             |
| Encryption | AES-GCM through WebCrypto. The key comes from the password with PBKDF2 and a random salt per user   |
| The key    | Made at login, kept in memory only, can't be exported, forgotten at log out                         |
| Reading    | zod checks every value. Data that can't be decrypted or doesn't match reads as empty, never a crash |
| Access     | Only `packages/storage` may use `localStorage` or `indexedDB`. A lint rule blocks it elsewhere      |

`openUserStorage({ app, userId, password })` returns
`{ get(key, schema), set(key, value), remove(key), close() }`.

| Data                                     | Saved?                                                                            |
| ---------------------------------------- | --------------------------------------------------------------------------------- |
| Token, password, encryption key          | Never                                                                             |
| Open order: key and order id             | Yes                                                                               |
| Refund in progress: key, payment, amount | Yes, until the outcome is known                                                   |
| Menu                                     | Yes. Put into the cache at login, then refreshed from the server                  |
| Payments and their details               | No. They hold payer names, which are personal data, and the till is online anyway |

- The server stores idempotency keys per user, so only the cashier who started
  an order or refund may resend it. Encryption makes that automatic, because
  no other cashier can open it. See
  [API gap 4](api-gaps.md#4-no-way-to-look-up-an-unknown-refund).
- Log out and a session end leave the saved data on the device for that
  cashier's next login.

## Screens

| Route                  | Shows                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `/`                    | "Welcome to Zahln", and **Continue** to the login screen                             |
| `/login`               | Username and password form. `invalid_credentials` shows "Wrong username or password" |
| `/charge`              | The menu and the cart, with the total for student, staff and guest                   |
| `/charge/:orderId`     | QR, countdown and live status                                                        |
| `/payments`            | This till's payments, newest first, paged, searchable by payment or order id         |
| `/payments/:paymentId` | Amount, refunded, refundable, refunds, history, and the refund form                  |

A header shows the cashier and the till, links to Charge and Payments, and has
Log out.

## Data hooks

| Hook              | Call                                    | Refetches                                                    |
| ----------------- | --------------------------------------- | ------------------------------------------------------------ |
| `useSession`      | The client, no network                  | Never                                                        |
| `useLogin`        | `POST /sessions`                        | Mutation                                                     |
| `useLogout`       | The client, no network                  | Mutation                                                     |
| `useMenu`         | `GET /mensas`, then the cashier's mensa | Once per login, starting from the saved copy                 |
| `useCreateOrder`  | `POST /orders`                          | Mutation                                                     |
| `useOrder`        | `GET /orders/{id}`                      | Every 2 seconds until `paid` or `expired`                    |
| `usePayments`     | `GET /payments`, paged with `cursor`    | On opening the screen, and on Refresh                        |
| `usePayment`      | `GET /payments/{id}`                    | On opening, then every 2 seconds while a refund is `pending` |
| `useCreateRefund` | `POST /payments/{id}/refunds`           | Mutation                                                     |

## Charge flow

1. The cashier adds items to the cart, 1 to 20 of each.
2. **Charge** creates the key in `charge`, then sends `POST /orders`.
3. On success the till opens `/charge/:orderId`. The order's key and id are
   saved in the cashier's storage.
4. The till polls the order until it's `paid` or `expired`.

| Situation                                  | The till shows                                                                                                                   |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Order being created                        | "Creating order…"                                                                                                                |
| Create failed, outcome unknown             | "Couldn't confirm the order", and **Try again**, which sends the same key                                                        |
| `open`                                     | QR, countdown in server time, "Waiting for the student"                                                                          |
| `paying`                                   | "Payment being checked"                                                                                                          |
| `paying`, then `open` with a newer version | "Payment declined. The student can try again."                                                                                   |
| `paid`                                     | "Paid", with the amount and price group from the payment, and **New order**                                                      |
| Countdown at 0                             | "Time's up, checking…". "Expired" only once the server says `expired`, as a payment may still be checked                         |
| Polling fails                              | The last known state, with "Connection problem, checking…". Never a result                                                       |
| App restarted                              | After login, the till goes back to the saved order and polls it                                                                  |
| New order while one is still open          | A warning that the old QR can be paid until it expires. The till keeps checking the old order and shows a notice if it gets paid |

- Changing the cart after a failed create makes a new order with a new key.
  Nothing is lost: an order moves no money, and its QR was never shown.
- **New order** clears the cart and the saved order id.

## Refund flow

1. On `/payments` the cashier finds the payment, by scrolling or searching.
2. `/payments/:paymentId` shows the amount, refunded, pending refunds,
   refundable, the refunds and the history.
3. **Refund all** fills in the refundable amount. A partial amount must be
   above 0 and at most `refundableAmountCents`. The reason is optional.
4. A confirm dialog: "Refund €4.50?"
5. Confirming creates the key in `refund`, then sends
   `POST /payments/{id}/refunds`. The key, payment and amount are saved in the
   cashier's storage until the outcome is known.
6. The till polls the payment until the refund is `completed` or `failed`.

| Situation                | The till shows                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| Sending                  | "Sending refund…"                                                                                |
| Outcome unknown          | "Couldn't confirm the refund", the form locked, and **Check again** with the same key and amount |
| `pending`                | "Refund being processed"                                                                         |
| `completed`              | "Refunded €4.50"                                                                                 |
| `failed`                 | "Refund failed". The form opens again, and a new attempt gets a new key                          |
| `refund_exceeds_payment` | The amount is more than can still be refunded                                                    |
| `payment_not_refundable` | The payment isn't confirmed                                                                      |
| `refund_window_closed`   | The payment is older than 30 days                                                                |
| `forbidden`              | The payment was made at another till                                                             |

- **The form stays locked while the outcome is unknown.** Changing the amount
  would make a new key, and both refunds could go through.
- The same applies after a restart: the saved refund comes back as
  **Check again**.

## Layout and access

- Landscape on a tablet. It also works in portrait, because Android 16 ignores
  the orientation lock on tablets.
- Every string in English and German. Amounts and times are formatted with
  `Intl` in the active language.
- Touch targets of at least 48 px. `@zahln/ui/touch.css` gives every button
  and field a minimum height, in the till and the student app.
- Status changes are announced, so TalkBack users hear "Paid".

## Build order

Each piece is one or two commits, and I stop after each.

The static screens and the session come first.

| #   | Piece                                                                                                                                                       | Done when                                                                                                                                                                       |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Static screens: welcome and login, with the router. No API yet                                                                                              | **Continue** opens the login screen                                                                                                                                             |
| 2   | `domain`: schemas for the user, the session and the error body                                                                                              | Tests pass                                                                                                                                                                      |
| 3   | `api`: `http`, `clock`, `errors`, `session` and `POST /sessions`                                                                                            | Tests: a token expiring mid-request, three `401`s with one login, a wrong password ending the session without looping, a network error that keeps the session, an early renewal |
| 4   | `storage`: per-cashier encrypted storage                                                                                                                    | Tests: A's data can't be read with B's key, a wrong password reads as empty, nothing can be read after `close()`, damaged data reads as empty                                   |
| 5   | Till base: TanStack Query with its settings, the client, session hooks, guard, the login screen wired to the session, header with log out, layer lint rules | In the dev server: logging in and out works, a wrong password shows its message, and requests still work after 5 minutes without a login screen                                 |
| 6   | Charge flow: mensa, menu and order schemas and calls; the `cart` and `charge` slices, with tests                                                            | An order paid through the API as `student` shows "Paid", an unpaid one shows "Expired", and a killed app returns to the open order                                              |
| 7   | Refund flow: payment and refund schemas and calls; the `refund` slice, with tests                                                                           | Full and partial refunds work, each refusal shows its message, and the form locks when the outcome is unknown                                                                   |
| 8   | Finish: German strings, portrait layout, TalkBack labels, a run on a tablet emulator                                                                        | All checks pass                                                                                                                                                                 |

## Libraries added

| Library                           | Why                                   |
| --------------------------------- | ------------------------------------- |
| `@tanstack/react-query`           | Server data: caching, polling, paging |
| `@reduxjs/toolkit`, `react-redux` | The till's own state, from piece 6    |
| `react-router`                    | Screens, from piece 1                 |
| `qrcode.react`                    | Draws the QR as SVG                   |
| `idb-keyval`                      | IndexedDB in about 1 KB               |
| `fake-indexeddb`                  | IndexedDB for tests only              |

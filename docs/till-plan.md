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
| Shared rules          | `packages/domain`                       | zod schemas, money formatting, order and payment state helpers                                                                                                 |

Rules between the layers, enforced by lint where possible:

- Screens read the store and the data hooks. They never import `@zahln/api`.
- Only `data/` imports `@zahln/api`.
- The store holds no server data and sends no requests.
- `packages/api` and `packages/domain` don't import React.

### The session

The session lives in the data layer, not in the store.

| Part                                     | Owner                             | Why                                                                                                                                                    |
| ---------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Token and password                       | `packages/api` client, in memory  | The server can end a token before `expiresAt`, so only a `401` says it's gone. The client then logs in again and resends, in the middle of the request |
| The logged-in cashier: name, till, mensa | TanStack Query, key `["session"]` | Screens read it like any other data. It comes from the client, not the network, so a refetch never sends a login                                       |

- Several requests that hit `401` at the same time trigger one login, not
  several.
- If logging in again fails, the client drops the session and the till goes
  back to the login screen.
- Log out drops the token and password and clears the query cache, so nothing
  from the last cashier stays on screen.

### Query client settings

| Setting                                       | Value                                      | Why                                                                           |
| --------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------- |
| `retry`                                       | `false`                                    | Our client is the only one that retries, so retries don't multiply            |
| `networkMode`                                 | `"always"`                                 | The WebView's offline flag is unreliable. Our client handles failures         |
| `structuralSharing` on order and payment data | Keeps the old data when `version` is lower | The server can return an older state, and "paid" must never go back to "open" |
| Mutations                                     | `retry: false`, and the key is passed in   | A mutation never makes up its own key and never retries                       |

## Screens

| Route                  | Shows                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------ |
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
| `useMenu`         | `GET /mensas`, then the cashier's mensa | Once per login                                               |
| `useCreateOrder`  | `POST /orders`                          | Mutation                                                     |
| `useOrder`        | `GET /orders/{id}`                      | Every 2 seconds until `paid` or `expired`                    |
| `usePayments`     | `GET /payments`, paged with `cursor`    | On opening the screen, and on Refresh                        |
| `usePayment`      | `GET /payments/{id}`                    | On opening, then every 2 seconds while a refund is `pending` |
| `useCreateRefund` | `POST /payments/{id}/refunds`           | Mutation                                                     |

## Charge flow

1. The cashier adds items to the cart, 1 to 20 of each.
2. **Charge** creates the key in `charge`, then sends `POST /orders`.
3. On success the till opens `/charge/:orderId`. The store saves the order id
   on the device.
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
   `POST /payments/{id}/refunds`. The store saves the key, payment and amount
   on the device until the outcome is known.
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
- Touch targets of at least 48 px.
- Status changes are announced, so TalkBack users hear "Paid".

## Build order

Each piece is one or two commits, and I stop after each.

| #   | Piece                                                                                                                              | Done when                                                                                                                          |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `domain`: schemas for user and session, mensa and menu, order, payment, refund and the error body; money formatting; version check | Tests pass                                                                                                                         |
| 2   | `api`: client core and the till's seven calls                                                                                      | Tests replay a lost response, a duplicate, a stale read, a session ending mid-request, and two requests hitting `401` at once      |
| 3   | Till base: libraries, router, store, query client settings, layer lint rule, login, session, log out                               | Logging in and out works on the emulator                                                                                           |
| 4   | Charge flow, with tests for the `charge` slice                                                                                     | An order paid through the API as `student` shows "Paid", an unpaid one shows "Expired", and a killed app returns to the open order |
| 5   | Refund flow, with tests for the `refund` slice                                                                                     | Full and partial refunds work, each refusal shows its message, and the form locks when the outcome is unknown                      |
| 6   | Finish: German strings, portrait layout, TalkBack labels, a run on a tablet emulator                                               | All checks pass                                                                                                                    |

## Libraries added

| Library                           | Why                                   |
| --------------------------------- | ------------------------------------- |
| `@tanstack/react-query`           | Server data: caching, polling, paging |
| `@reduxjs/toolkit`, `react-redux` | The till's own state                  |
| `react-router`                    | Screens                               |
| `qrcode.react`                    | Draws the QR as SVG                   |

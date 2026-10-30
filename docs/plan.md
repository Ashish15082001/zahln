# Build plan

The work is split into six steps on the `version1.0.0` branch. A step starts
only once it is approved. It ends with every check passing and lands as a few
small commits. This file is updated as steps finish. The reasoning behind the
bigger choices goes in [design.md](design.md).

## Status

| Step | Scope                                                   | Status                     |
| ---- | ------------------------------------------------------- | -------------------------- |
| 0    | Setup: spec copy, UI kit, translations, settings, tests | Done                       |
| 1    | `domain` and `api` packages, with tests                 | Next, waiting for approval |
| 2    | Till                                                    | Planned                    |
| 3    | Student app                                             | Planned                    |
| 4    | Dashboard                                               | Outline only               |
| 5    | Ship                                                    | Planned                    |

## Rules for every step

- **Money moves once.** An idempotency key is created and saved before the
  first send. Every retry reuses it. A new key means a new order, payment or
  refund.
- **No screen shows a result that isn't true.** "Paid", "confirmed" and
  "declined" come only from a server response. When an app loses track, it
  shows "checking" and asks the server again.
- **Late answers never win.** A response with a lower `version` than one
  already seen is dropped. Server time comes from the `Date` header, not the
  device clock.
- **State and routing.** TanStack Query for reads only: menu, history, reports.
  The order, payment and refund flows run on `useReducer` over the shared
  states. react-router for screens. No Redux.
- **UI.** shadcn components stay as generated. Our own components follow the
  React house rules.
- **Languages and access.** Every screen is in English and German. The pay
  flow works with TalkBack.
- **Done means** format, typecheck, lint, tests and build pass, and the Android
  sync works for both apps.

## Step 0: Setup (done)

| Commit    | What it does                                                                                                                           |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `3b2e3eb` | Copy of the API spec at `docs/api/openapi.json`                                                                                        |
| `a6ee619` | shadcn/ui (Radix, preset `b38BlFUlE`) in `packages/ui`, Tailwind v4 in all three apps, Roboto bundled, `success` and `warning` colours |
| `87d7f40` | English and German with i18next. English is the fallback                                                                               |
| `c695b81` | One `.env` at the repo root, checked when each app builds. Apps at version 1.0.0                                                       |
| `c0299a4` | Vitest, `pnpm test`, and a CI test step                                                                                                |

Changes from the plan:

- **English, not German, is the fallback language.**
- **The apps are at version 1.0.0, not 0.1.0.** The server refuses payments
  from versions below its `minAppVersion` of 1.0.0 with 426.
- **Strings live in `en.ts` and `de.ts`, not JSON,** so a missing German
  string fails the typecheck.
- **Language detection is a small tested function,** `pickLanguage`, instead
  of the i18next detector plugin.
- **`cn` is held at 0.5.0.** 0.5.1 was too new for pnpm's minimum release age,
  and that check stays on.
- **Vitest in `domain` comes with its first code** in step 1.

## Step 1: `domain` and `api` packages

- **Data checks:** a zod schema per entity, split into `backend.ts` and
  `frontend.ts`: session, config, mensa, order, payment, refund, daily totals
  and the error body. Every response is checked against its schema.
- **Money:** integer cents, formatted with `Intl`.
- **Client:**
  - Each attempt has a deadline.
  - It retries only when the error says `retryable`, or when no response came
    back. Retries back off and reuse the same `Idempotency-Key`.
  - On `401 session_expired`, it logs in again and resends.
  - Server time comes from the `Date` header.
  - Errors come back as one typed set of cases, one per server `code`.
- **Order and payment states:** pure functions.
  - `paid`, `confirmed` and `declined` are entered only from a server
    response.
  - A final state can't change.
  - An explicit `unknown` state means "sent, outcome not known yet".
- **Tests** replay the server's failures:
  - the server saved the request but the response was lost
  - a duplicate response
  - an out-of-date read
  - the session expiring in the middle of a payment

## Step 2: Till

- **Login:** as a cashier, for example `cashier-campus-1`. The till and mensa
  come from the user record, and the menu from `GET /mensas`.
- **Charge:** the cashier rings up items, then the till sends `POST /orders`.
  - The idempotency key is created on tap and reused for every retry.
  - A changed cart is a new order with a new key.
- **Waiting:** the till shows the QR with a countdown based on server time,
  and polls `GET /orders/{id}`.
  - It shows "Paid" only when the order status is `paid`.
  - If the connection drops, it shows "Checking", never a result.
- **Refund:** list the till's payments, open one, enter an amount (capped at
  what's still refundable) and a reason, then `POST /payments/{id}/refunds`.
  - One key per refund.
  - The till polls the payment until the refund is `completed` or `failed`.
  - Each refusal gets its own message:

| Code                     | The message says                              |
| ------------------------ | --------------------------------------------- |
| `refund_exceeds_payment` | The amount is more than can still be refunded |
| `payment_not_refundable` | The payment isn't confirmed                   |
| `refund_window_closed`   | The payment is older than 30 days             |
| `forbidden`              | The payment was made at another till          |

- **Layout:** landscape, and it also works in portrait, because Android 16
  ignores the orientation lock on tablets.

## Step 3: Student app

- **Start:** pick student, staff or guest, then log in. The app reads
  `GET /config` at start and again before paying. The config can force an
  update or pause payments.
- **Scan:** ML Kit's Google code scanner. It needs no camera permission and is
  light on a low-end phone. `GET /orders/{id}` then loads the confirm screen:
  mensa, items and amount.
- **Pay:** biometrics, or the device PIN when there are none, then
  `POST /orders/{id}/payments` with the amount shown. The key is saved on the
  device before the first send.
- **History:** `GET /payments`, paged, including payments still being checked.
  The detail view shows refunds and the full event history.
- **Screen reader (TalkBack):** the result is announced, focus moves to the
  result heading, and every control has a label.
- **`native` package:** Capacitor wrappers for the scanner, biometrics, secure
  storage and network status.

What the app does with each answer to "pay":

| Server answer                                                            | The app                                                                                                                        |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| 201 `confirmed` / `declined`                                             | Shows that result                                                                                                              |
| 201 `pending`                                                            | Shows "being checked" and polls the payment. After about 30 seconds it says the payment is still pending and points to history |
| 502 / 504 / no response / 503 `unavailable`                              | Shows "checking…" and retries with the **same** key. It never offers to pay again                                              |
| 401 `session_expired`                                                    | Logs in again and retries with the same key                                                                                    |
| 409 `amount_mismatch`                                                    | Reloads the order and shows the new amount. Confirming again uses a new key                                                    |
| 409 `order_expired` / `order_already_paid` / `order_payment_in_progress` | Explains which one. No retry                                                                                                   |
| 426                                                                      | Shows that an app update is required                                                                                           |
| 503 `payments_disabled`                                                  | Shows "payments paused"                                                                                                        |
| App killed mid-payment                                                   | On restart, picks up the saved key and checks the payment's status                                                             |

## Step 4: Dashboard (outline)

Taken from the brief and the API. It gets a detailed plan, approved before the
step starts.

| Feature                                          | API                                                                                            |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Login as `finance`                               | `POST /sessions`                                                                               |
| Daily totals per mensa and per till, for one day | `GET /reports/daily-totals?date=`. Days are Europe/Berlin; pending payments are reported apart |
| Payments that need attention, with the reasons   | `GET /payments?needsAttention=true`                                                            |
| Search, with the full history of each payment    | `GET /payments` with filters and cursor paging, then `GET /payments/{id}`                      |
| CSV export for finance                           | Pages through `GET /payments` with the current filters and builds the file in the browser      |

Open for the detailed plan:

- Which day the totals open on.
- The CSV columns, and escaping cells that a spreadsheet would run as formulas.

## Step 5: Ship

- Signed release APKs for the student app and the till, built by CI.
- The dashboard deployed to a public URL. The host is still to be chosen.
- `VITE_CANDIDATE_ID` set as a GitHub repository secret, so CI can build.
- A minimum WebView version for both Android apps, because Tailwind v4 needs
  Chrome 111 or later. Older WebViews get a readable error page.
- README: what I built, what I left out and why, AI tools, and test logins.
- The design document, written from what was built.

## Optional items from the brief

| Item                                           | Plan                                          |
| ---------------------------------------------- | --------------------------------------------- |
| Minimum app version and switching payments off | Built in step 3, from `GET /config`           |
| Crash reporting                                | Not decided. At least described in design doc |
| CI on every push                               | Done                                          |

## Carried forward

- shadcn's `destructive` text on its own 10% tint has 4.39:1 contrast, below
  the 4.5:1 minimum. The "declined" screen must not use that pairing.
- The alert dialog blurs the page behind it, which is slow on a low-end phone.
  Check it on a device in step 3.

## API gaps, for the design doc

- **No way to cancel an order.** If a student walks away, the old QR can still
  be paid for 5 minutes while the cashier rings up the next order. Only the
  server can really fix this.
- **No refresh token.** The app has to keep the password to log in again every
  5 minutes. That's fine for seeded test users but not for production.
- **No push.** The till and the app can only poll for results.

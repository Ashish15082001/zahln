# Build plan

The work is split into six steps on the `version1.0.0` branch. A step starts
only once it is approved. It ends with every check passing and lands as a few
small commits. This file is updated as steps finish. The reasoning behind the
bigger choices goes in [design.md](design.md).

## Status

| Step | Scope                                                   | Status                                                                                                    |
| ---- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 0    | Setup: spec copy, UI kit, translations, settings, tests | Done                                                                                                      |
| 1    | `domain`, `api` and `storage`: the parts the till needs | Done, except `storage`                                                                                    |
| 2    | Till                                                    | In progress: login, order QR and payments list done, and token renewal                                    |
| 3    | Student app                                             | In progress: login, history, scan and pay done, with the fingerprint, face or PIN check and token renewal |
| 4    | Dashboard                                               | Outline only                                                                                              |
| 5    | Ship                                                    | Planned                                                                                                   |

What each app does, and how, is in [till-plan.md](till-plan.md) and
[student-plan.md](student-plan.md).

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
- **Two layers.** UI (screens) and data access (TanStack Query hooks on top of
  `packages/api`). Screens never call the API directly. State the server
  doesn't have, such as the cart, stays in the screen that owns it. A Redux
  store was planned for it and hasn't been needed. TanStack Query never takes
  an older `version`, and retries on its own only to read a payment's detail
  again. react-router for screens.
- **UI.** shadcn components stay as generated. Our own components follow the
  React house rules. In the two Android apps every screen is built on
  `ScreenLayoutJSX`: a header that stays at the top, a footer that stays at
  the bottom, and a page no taller than the screen. A long press there
  doesn't select text, except in fields. Two buttons in a footer sit side
  by side at the same width, the main one on the right. Refresh is an icon
  button, and every date and time has a calendar icon.
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

Built in two halves: the parts the till needs in this step, and the student
app's parts (config, pay, the app version header) in step 3.

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

Done:

| Commit    | What it does                                                                                                                                                                            |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `232cbc3` | zod schemas for users, sessions, errors and mensas in `domain`, split into `backend.ts` and `frontend.ts`                                                                               |
| `15ba535` | The login request's shape                                                                                                                                                               |
| `046f30b` | The HTTP client: 10 s per attempt, 3 attempts with backoff, the same key on every retry, server time from the `Date` header, and errors as `problem`, `noResponse` or `invalidResponse` |
| `4f24faf` | The client, the server clock, the errors, the login request and the saved-login store move to `packages/api`, for both apps                                                             |

Order, payment and refund shapes came with the screens that use them, in steps
2 and 3.

Changes from the plan:

- **Renewing came later than this step.** Neither app kept the password at
  first, so a refused token logged out. Both now log in again with the
  password kept in memory, built with the student app's pay flow
  ([student-plan.md](student-plan.md#renewing-the-token),
  [API gap 2](api-gaps.md#2-no-refresh-token)).
- **"Outcome unknown" is a kind of error, not an order state.** A lost
  response comes back as `noResponse`, and the screen shows "checking" and
  resends with the same key.
- **`storage` isn't started.** It comes with the first thing the till must
  keep across a restart: the open order or a refund in progress.

## Step 2: Till

Detailed in [till-plan.md](till-plan.md):

- **Charge:** ring up an order and show its QR. "Paid" and "Expired" are shown
  only when the server says so.
- **Refund:** in full or in part, with one message per refusal. The form locks
  while an attempt's outcome is unknown.
- **Layout:** landscape, and it also works in portrait, because Android 16
  ignores the orientation lock on tablets.

Done so far:

| Commit    | What it does                                                                                                                                                                                                  |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `4b9df57` | Welcome and login screens                                                                                                                                                                                     |
| `319be5d` | Buttons and fields at least 48 px tall, in the till and the student app                                                                                                                                       |
| `262b323` | Logs the cashier in. Only a cashier with a till and a mensa gets in                                                                                                                                           |
| `adcdcfe` | shadcn's table, tabs and checkbox, sized for touch                                                                                                                                                            |
| `6d3ac43` | Loads the cashier's mensa. Log out clears every cached answer                                                                                                                                                 |
| `65a1540` | Home's Mensa tab: the menu with the student, staff and guest price of each dish, ticked to pick it                                                                                                            |
| `3971371` | − and + to set how many of each dish, 1 to 20                                                                                                                                                                 |
| `e0c5160` | Create order, with one idempotency key per cart, kept for Try again while the outcome is unknown. The order is then polled every 2 seconds                                                                    |
| `b8d6bf0` | The order's QR and live status in a dialog that stays until the order is paid or expired                                                                                                                      |
| `c79fec5` | The login as one cashier session, with the token kept out of the UI                                                                                                                                           |
| `5b09b46` | A store that saves the login in `localStorage`                                                                                                                                                                |
| `12d86b0` | The saved login comes back on reopen, until its token runs out                                                                                                                                                |
| `4b5d3ce` | Route guards: signed-out and signed-in screens, so no screen redirects on its own                                                                                                                             |
| `9e202b8` | The order code under the QR, for phones that can't scan                                                                                                                                                       |
| `5650f20` | The cashier's view of `GET /payments` in `packages/api`: each payment with who paid, what can still be refunded and whether it needs attention                                                                |
| `a1be9af` | The status badge's look moves to `packages/ui`, so the till and the student app show a status the same way                                                                                                    |
| `b26de4b` | Home's second tab lists the till's payments, 20 at a time with Load more: time, order code, amount, refunded, status, payer and items. Loading, error, empty and refresh-failed states, in English and German |
| `8e53415` | Every till screen on the shared screen layout (`b5af400`): the greeting, Log out and the tabs at the top, and Create order at the bottom of the Mensa tab                                                     |
| `73367f8` | The till renews its token with `createSessionRenewal`, the password kept in memory: Create order refused with a 401 is sent again with the same key, and an open QR stays open. Log out forgets the password  |

Changes from the plan:

- **One Home screen with two tabs, Mensa and Payments,** instead of
  `/charge`, `/charge/:orderId` and `/payments` screens. The order's QR is a
  dialog over the Mensa tab.
- **The cart is the Mensa tab's own state,** not a Redux slice. Log out or a
  reload clears it.
- **Create order stays at the bottom of the screen** on the Mensa tab, so it
  is one tap away under a long menu. The Payments tab has no footer: Load
  more belongs at the end of the list.
- **The QR dialog closes only with "I acknowledge",** once the order is paid
  or expired. There is no New order button and no countdown on the till, and
  without a cancel call the cashier can't end an order early
  ([API gap 1](api-gaps.md#1-no-way-to-cancel-an-order)).
- **The login is saved on the device** until its token runs out, so a quick
  reopen skips the login screen.
- **The Payments tab is fetched each time it opens** and with Refresh, with no
  polling. While an order is open its QR dialog covers the screen, so the tab
  is always fetched again after a payment.
- **It lists payments, not orders.** The API has no list of orders, so an
  order nobody paid doesn't appear
  ([API gap 7](api-gaps.md#7-no-list-of-orders)).
- **No search by id yet.** Paging only, like the student app's history.
- **The status comes before the payer and the items.** In portrait the table
  scrolls sideways, and the status must stay in view. Home is wider than
  before, so the whole table fits a tablet in landscape.

Not yet:

- Refunds, with the payment's detail.
- Keeping the open order across a restart, and with it `packages/storage`.
- Renewing the token after a reopen, which needs a refresh token or the
  password in the Android Keystore
  ([API gap 2](api-gaps.md#2-no-refresh-token)).
- Turning off Android backup, so the saved login can't be copied off the
  device.

## Step 3: Student app

Done so far:

| Commit    | What it does                                                                                                                                                                                                                                                   |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `4f24faf` | The till's HTTP client, server clock, errors, login request and saved-login store move to `packages/api`, for both apps                                                                                                                                        |
| `d55eb4f` | Welcome, login and home ("Hello, {name}", Log out), built like the till's. Only a payer can log in: `student`, `staff` or `guest`. The login is kept under `zahln.student.session.v1`                                                                          |
| `3d56df8` | `GET /payments` in `packages/api`, with the payment's schemas in `domain`. A lower `version` never replaces a payment already shown                                                                                                                            |
| `10598a3` | `formatCents` moves from the till to `packages/i18n`, next to a new `formatDateTime` that always shows Berlin time                                                                                                                                             |
| `9ac15a4` | shadcn's `Empty` component, for empty states and full-page errors                                                                                                                                                                                              |
| `cd8250a` | Home lists the payer's payments, 20 at a time with Load more: mensa, amount, date, status, items and refunds. Loading, error, empty and refresh-failed states, in English and German                                                                           |
| `214e76d` | `GET /payments/{paymentId}` in `packages/api`, with schemas for refunds and history events in `domain`                                                                                                                                                         |
| `4c013df` | `formatDateTimeWithSeconds`, since a payment's history steps are often seconds apart                                                                                                                                                                           |
| `7a4c4ea` | Each list row opens the payment's detail: amount, mensa and till, items, total, refunds and the history, oldest first. Not found, error, loading and refresh-failed states. Focus moves to the heading on open, and Back returns to the same place in the list |
| `dae4013` | Google's code scanner in `packages/native`, and reading the order id from the till's QR                                                                                                                                                                        |
| `ef92468` | A Scan QR footer on Home that opens the scanned order                                                                                                                                                                                                          |
| `1f503dc` | When Google's scanner can't run: the app's own camera screen, then typing the order code                                                                                                                                                                       |
| `9bb9f2b` | `getOrder` moves to `packages/api`, next to the payer's view of an order at their price                                                                                                                                                                        |
| `e29f45e` | The scanned order: mensa, till, items and the payer's price, with a countdown on the server's clock. Paying, paid, expired, not found and error states                                                                                                         |
| `3c5eb93` | `payOrder` (`POST /orders/{id}/payments`) in `packages/api`. The idempotency key maker moves there from the till, for both apps                                                                                                                                |
| `e9ea4e1` | A pay key store that keeps one key per order and amount on the device, `needsSameKey` for when a retry must reuse it, and `toOrderPayState` in `domain` for whether an order can still be paid                                                                 |
| `abf559e` | The Pay page at `/pay/:orderId`: a scan opens it, with the order, a countdown and Pay, and a message and a next step for every answer. The order page becomes read only                                                                                        |
| `dbc9b28` | After Pay the page reads the payment every 2 seconds for 30 seconds: Being checked, Paid, Still being checked with Refresh, or back to Pay after a decline. Focus moves to each result                                                                         |
| `a5d1f85` | `identityCheck` in `packages/native`: Android's fingerprint, face or PIN dialog through `@capgo/capacitor-native-biometric`, with every way it can end as a result                                                                                             |
| `fc8814c` | The pay key store can tell whether a key is already saved for an order and amount                                                                                                                                                                              |
| `5642562` | Pay asks for a fingerprint, the face or the phone's PIN before anything is sent: Confirming…, then Paying…, or Too many tries and Couldn't confirm it's you. A resend under a saved key doesn't ask again                                                      |
| `b890666` | `createSessionRenewal` in `packages/api`: logs in again with the password kept in memory 30 seconds before the token ends and after a 401, once for every request waiting on it. A changed password ends the session; no answer keeps it                       |
| `fba063e` | The student app renews its token, so a payment refused with a 401 is sent again with the same key instead of stopping at the login screen. Log out forgets the password                                                                                        |
| `338b77e` | A long press no longer selects text, in the student app and the till. Fields stay selectable, and so does the payment detail's Payment ID line, to paste into a message                                                                                        |
| `b5af400` | `ScreenLayoutJSX` in `packages/ui`, for both apps: a header that stays at the top, a footer that stays at the bottom, and room for the status bar and the nav bar                                                                                              |
| `c2e46ec` | Every student screen on it: Back and the title at the top, and Scan QR, Pay and a payment's result buttons at the bottom. A page is never taller than the screen                                                                                               |
| `168bf1d` | shadcn's `Item`, with the `Separator` it uses                                                                                                                                                                                                                  |
| `4458398` | A gear button in place of Log out on Home, opening a Settings page, empty for now                                                                                                                                                                              |
| `9870e5c` | Home's payment rows built from `Item`, full width: mensa, amount, date, status and any refund. The dishes stay on the detail                                                                                                                                   |
| `b1f81f9` | Refresh as one shared icon button in both apps, turning while it works and named for TalkBack                                                                                                                                                                  |
| `f36c91b` | Every date and time in both apps as a calendar icon and the value, from one shared component                                                                                                                                                                   |
| `aba823c` | The Pay footer after paying: See the payment and Done side by side at the same width. Refresh moves to the header                                                                                                                                              |

Changes from the plan:

- **History doesn't poll.** It is fetched when Home opens, when the app comes
  back to the front, and with Refresh. A seeded payment has been pending for
  days, so polling for it would never stop. The detail works the same way.
- **Each status has a solid badge with an icon and a word.** Green, amber and
  red with white text, because red text on its own 10% tint is below 4.5:1.
- **The detail drops a read older than the list's copy, and asks again.** Up
  to 3 more times, 1 second apart, then it shows an error. It is the one
  retry TanStack Query makes on its own: a read is safe to repeat. A newer
  detail also updates the list, so going back never shows an older status.
- **An unknown history event shows as "Other change"** instead of failing the
  whole payment, like an unknown attention reason.
- **"Not found" also covers another payer's payment.** The server answers
  both with `404 not_found`, so the app can't tell them apart.
- **Scanning has two fallbacks.** Google's scanner needs Google Play services.
  Without it the app opens its own camera screen, and without a camera the
  payer types the code printed under the QR
  ([API gap 8](api-gaps.md#8-no-short-order-code)).
- **The QR's text is `zahln://pay?order=<id>`,** as the dev server sends it.
- **Paying has its own page.** A scan opens the Pay page at `/pay/:orderId`,
  which shows the order, Pay and every answer, each with a next step. The
  order page at `/orders/:orderId` is read only, and nothing links to it.
  The flows and edge cases are in
  [student-plan.md](student-plan.md#paying).
- **The key is spent after a clear refusal too,** as on the till, not only
  after a decline or a changed price: the server may answer a reused key
  with the same refusal.
- **A refused token logs in again with the password kept in memory only,**
  as the plan's "logs in again and retries with the same key" says, and the
  token is also renewed 30 seconds before it ends. The password is never
  saved, so after a reopen a refused token still logs out
  ([API gap 2](api-gaps.md#2-no-refresh-token)).
- **The key is spent when the session ends,** not kept in case an earlier
  try reached the server. The server already refuses a new key while a
  payment is pending or paid, and a kept key would let another payer on the
  same phone skip the fingerprint, face or PIN check. The reasons are in
  [student-plan.md](student-plan.md#why-the-key-is-spent-when-the-session-ends).
- **The payment is read every 2 seconds for 30 seconds,** then the page
  says "Still being checked" and offers Refresh. History on Home shows the
  final result.
- **Pay turns off when the countdown reaches 0,** Check again included. The
  order is read every 3 seconds until the server says expired or paid.
- **A phone without a screen lock pays without the fingerprint, face or PIN
  check,** where the plan said nothing about it: there is nothing on such a
  phone to protect, and an emulator has no screen lock. Check again, and Pay
  with a key that is still saved, don't ask again: the payer confirmed that
  payment already. Weak face unlock counts. The reasons are in
  [student-plan.md](student-plan.md#confirming-its-the-payer).

Not yet:

- Renewing the token after a reopen, which needs a refresh token or the
  password in the Android Keystore.
- `GET /config`: a forced update and payments switched off.
- Picking student, staff or guest before login. The server already sends the
  account's role.
- Log out on the Profile page. Profile is empty for now, so the app has
  no way to log out yet.

The plan for the whole step:

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
  the 4.5:1 minimum. The status badges use solid colours for that reason, and
  the pay flow's "declined" screen must not use the pairing either.
- The alert dialog blurs the page behind it, which is slow on a low-end phone.
  Check it on a device in step 3.
- When the till's order dialog closes, focus goes to the page instead of back
  to Create order, so TalkBack starts again from the top. The dialog opens
  without a trigger, and Radix returns focus only to one.
- The status bar and nav bar padding shows only on a device: desktop Chrome
  has neither bar. Check both apps on a phone and the tablet.

## API gaps

Kept in their own document: [api-gaps.md](api-gaps.md).

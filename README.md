# Zahln: The Mensa Lunch Rush

The student app, the till and the Studierendenwerk dashboard for the Zahln
frontend assignment, in one TypeScript monorepo.

## Try it

- **Dashboard:** live at <https://zahln-dashboard-three.vercel.app>. Log in
  with the **Finance** card.
- **Student app and till:** signed APKs, `zahln-student-v1.0.0.apk` for a
  phone and `zahln-till-v1.0.0.apk` for a tablet, are on the
  [v1.0.0 release](https://github.com/Ashish15082001/zahln/releases/tag/v1.0.0).
  They need Android 7 or later and an Android System WebView of Chrome 111 or
  later; an older WebView shows what to update. Android asks to allow
  installing from the browser or file manager the first time. The repo is
  private, so the release opens for its collaborators.

Test logins, all on the API's seeded data. The password is `test1234`
everywhere.

| Surface     | How to log in                                                                                                                                                                 |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Student app | A card each for **Student**, **Staff** and **Guest**, with no typing. The same order costs each a different amount                                                            |
| Till        | Username and password. `cashier-campus-1`, `-2` and `-3` work at Mensa am Campus, `cashier-nord-1` and `-2` at Mensa Nord, and `cashier-bibliothek-1` at Cafeteria Bibliothek |
| Dashboard   | The **Finance** card, the seeded `finance` user                                                                                                                               |

One payment from start to end: on the till, tick a dish and **Create order**.
In the student app, **Scan QR** and point the phone at the till's QR, then
**Pay**. A phone that can't scan offers to type the code under the QR. The
till shows **Paid**, and the payment is in the student's history, the till's
Payments tab and the dashboard's search.

## What I built

- **Till**, for a tablet: a cashier logs in, rings up an order from the
  mensa's menu, shows its QR and follows it until it is paid or expires, and
  sees the till's payments.
- **Student app**, for a phone: a payer scans the till's QR, checks the order
  at their price, confirms with a fingerprint, the face or the phone's PIN,
  and pays. Their history shows each payment with its refunds and full
  history. The server's config can turn Pay off before the tap while
  payments are paused, and asks an app too old to pay to update.
- **Dashboard**, for the web: daily totals per mensa and till on Berlin days,
  a payment search with filters and each payment's detail, the payments that
  need attention, and a CSV export.

What holds in all three:

- **Money moves once.** A payment or an order is sent with an idempotency key
  made before the first send, and every retry reuses it.
- **No screen shows a result that isn't true.** "Paid", "confirmed" and
  "declined" come only from the server. When an app loses track, it says
  it is checking and asks again.
- **Late answers never win.** A lower `version` never replaces what is shown,
  and server time comes from the `Date` header.
- **A token that runs out is renewed,** by logging in again with the
  password kept in memory, so a payment never stops halfway at the login
  screen.
- **English and German** everywhere, and the pay flow works with TalkBack.

Each surface has its own document: [docs/till-plan.md](docs/till-plan.md),
[docs/student-plan.md](docs/student-plan.md) and
[docs/dashboard-plan.md](docs/dashboard-plan.md). The build, step by step,
with every commit, is in [docs/plan.md](docs/plan.md).

## What I left out, and why

| Left out                                                          | Why                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Refunds on the till                                               | A refund whose answer is lost can only be checked by sending it again with its key, and keys are kept per user: another cashier resending it would refund twice ([API gap 4](docs/api-gaps.md#4-no-way-to-look-up-an-unknown-refund)). Done safely, the refund in progress is kept encrypted for the cashier who started it, which needs a storage package I didn't build. I put the time into the pay flow and the dashboard instead |
| An iOS build of the student app                                   | The brief names iOS and Android, and asks for an installable Android build. An iOS build needs Xcode on a Mac, and this was built on Windows. The app is Capacitor, and both its native plugins, the ML Kit scanner and the fingerprint, face or PIN check, ship iOS code, so iOS is `npx cap add ios`, the Face ID and camera usage strings in `Info.plist`, and a pass on an iPhone                                                 |
| The till's open order kept across a restart                       | The same storage package                                                                                                                                                                                                                                                                                                                                                                                                              |
| Renewing the token after the app is reopened or the page reloaded | The API has no refresh token ([API gap 2](docs/api-gaps.md#2-no-refresh-token)), and the password is never written to the device. After a reopen there is none to log in with, so the login lasts until the token runs out, at most 5 minutes. The password in the Android Keystore would close it on the phones                                                                                                                      |
| Theme and language on the student app's Profile                   | The choices show, but the app keeps the phone's language and light colours                                                                                                                                                                                                                                                                                                                                                            |
| A count of the payments a dashboard search matches                | The server sends no total ([API gap 10](docs/api-gaps.md#10-no-total-and-no-snapshot-when-paging-payments)), so the search says how many it has loaded                                                                                                                                                                                                                                                                                |
| Crash reporting                                                   | Optional in the brief, and not built. How I would add it, with Sentry in its EU region and no personal data, is in the [design document](docs/design.md#crash-reporting)                                                                                                                                                                                                                                                              |

What the API makes hard, and what I would change, is in
[docs/api-gaps.md](docs/api-gaps.md). Smaller items are under "Still to
build" in each surface's document.

## Stack

- **React 19 + Vite 8** on all three surfaces.
- **Capacitor 8** wraps the student app and the till as Android apps. The brief
  names React Native with Expo; Capacitor was cleared with Zahln before work
  started. The reasoning is in [docs/design.md](docs/design.md).
- **pnpm workspaces + Turborepo** for the monorepo.
- **zod** validates every API response at the boundary.
- **TanStack Query** for server data and **React Router** for screens.
- **i18next** for German and English.

## Layout

```
apps/
  student/     Student app: React + Capacitor (Android)
  till/        Till app: React + Capacitor (Android tablet)
  dashboard/   Studierendenwerk dashboard: React, static web build
packages/
  domain/      zod shapes, the server's and the apps', and version checks. No React, no DOM.
  api/         HTTP client: deadlines, retries, idempotency, response parsing, token renewal
  i18n/        i18next setup, the de/en strings, and money and date formats
  ui/          Accessible components shared by all three surfaces
  native/      Capacitor wrappers for the QR scanners and the fingerprint, face or PIN check, and the WebView check both Android apps run first
docs/
  plan.md            Build plan, step by step, with status and commits
  till-plan.md       The till: what it does, how, and what is still to build
  student-plan.md    The student app: what it does, how, and what is still to build
  dashboard-plan.md  The dashboard: what it does, how, and what is still to build
  api-gaps.md        What the API is missing, and what I would change
  design.md          Design document
assets/              App icon and splash screen sources, shared by all three surfaces
```

Packages export their TypeScript source and are compiled by each app's Vite
build, so there is no package build step. Imports name the file, for example
`@zahln/domain/<file>`.

A package with no code yet has no `typecheck` or `lint` scripts, because the
tools fail on an empty folder. Add them with the package's first file:

```json
"scripts": {
  "typecheck": "tsc -p tsconfig.json",
  "lint": "eslint ."
}
```

## Prerequisites

- Node 22 or later
- pnpm 12: `npm install -g pnpm`
- For Android: Android Studio with SDK 36, and JDK 21 (Android Studio's bundled
  JBR works). Set `JAVA_HOME` and `ANDROID_HOME`.

## Configuration

```sh
cp .env.example .env   # then set VITE_CANDIDATE_ID
```

One `.env` at the repo root serves all three apps. A build without a candidate
ID fails, rather than producing an app that gets 403 on every request. CI reads
the ID from the `VITE_CANDIDATE_ID` repository secret.

## Running it

```sh
pnpm install
pnpm dev          # student :5173, till :5174, dashboard :5175
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

### Android

```sh
pnpm --filter @zahln/student android:run    # build, sync, install on a device or emulator
pnpm --filter @zahln/student android:open   # open the native project in Android Studio
```

The same scripts exist for `@zahln/till`.

Live reload on a phone on the same Wi-Fi:

```powershell
pnpm --filter @zahln/student dev
$env:CAP_DEV_URL = "http://<laptop-LAN-IP>:5173"; pnpm --filter @zahln/student exec cap run android
```

`CAP_DEV_URL` is written into the native project at sync time. Clear it and run
`android:sync` again before building anything you hand over, or that build
loads your laptop's dev server.

### Icons and splash screens

`@capacitor/assets` makes every icon and splash screen from four sources in
`assets/`, cut from the Zahln logo:

| Source                                       | Holds                                                                                  | Becomes                                              |
| -------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `icon-only.png`                              | The Z on white, 1024 px. The word isn't on the icon: it can't be read at launcher size | Android's older icons, the favicon and the web icons |
| `icon-foreground.png`, `icon-background.png` | The Z on a transparent layer, and white                                                | Android's adaptive icon, which the launcher shapes   |
| `splash.png`                                 | The Z and the word on white, 2732 px                                                   | Android's splash screens, portrait and landscape     |

```sh
pnpm --filter @zahln/student assets     # Android icons and splash, and the web icons
pnpm --filter @zahln/till assets        # the same for the till
pnpm --filter @zahln/dashboard assets   # web icons only
```

Commit what they write; CI doesn't run them. The tool also rewrites
`AndroidManifest.xml` in its own formatting with nothing changed, so check
that file out again afterwards. Its web icons are PNG files named `.webp`, so
the manifest says `image/png`; browsers read them either way. There is no dark
splash, as the apps keep light colours.

## Shipping

CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs on every push:

- **Checks:** format, typecheck, lint, tests and build, then a debug APK of
  each Android app.
- **On `version1.0.0`:** the dashboard is deployed to Vercel, and both
  apps are built as signed release APKs. A job fails unless an APK carries
  the release key's certificate.
- **On a `v` tag,** e.g. `v1.0.0`: a GitHub Release with both signed APKs.

The release key lives in four repository secrets, never in the repo. A
release build without them, e.g. on a laptop, is unsigned. Details are in
[docs/plan.md](docs/plan.md#step-5-ship).

## AI tools

- **Claude Code (Anthropic):** planning, code, tests and docs, one step at a
  time; I reviewed and approved each step before it landed.

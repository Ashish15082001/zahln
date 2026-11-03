# Zahln: The Mensa Lunch Rush

The student app, the till and the Studierendenwerk dashboard for the Zahln
frontend assignment, in one TypeScript monorepo.

## Stack

- **React 19 + Vite 8** on all three surfaces.
- **Capacitor 8** wraps the student app and the till as Android apps. The brief
  names React Native with Expo; Capacitor was cleared with Zahln before work
  started. The reasoning is in [docs/design.md](docs/design.md).
- **pnpm workspaces + Turborepo** for the monorepo.
- **zod** validates every API response at the boundary.
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
  native/      Capacitor wrappers for the QR scanners and the fingerprint, face or PIN check, used by the student app
docs/
  plan.md            Build plan, step by step, with status and commits
  till-plan.md       The till: what it does, how, and what is still to build
  student-plan.md    The student app: what it does, how, and what is still to build
  dashboard-plan.md  The dashboard: what it does, how, and what is still to build
  api-gaps.md        What the API is missing, and what I would change
  design.md          Design document
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

## What I built

The till, the student app and the dashboard, each described in its own
document: [docs/till-plan.md](docs/till-plan.md),
[docs/student-plan.md](docs/student-plan.md) and
[docs/dashboard-plan.md](docs/dashboard-plan.md).

The dashboard is live at <https://ashish15082001.github.io/zahln/>: log in
with the Finance card.

## What I left out, and why

Written at the end. Until then, what each app still lacks is under "Still to
build" in its document, and what the API makes hard is in
[docs/api-gaps.md](docs/api-gaps.md).

## AI tools

- **Claude Code (Anthropic):** planning, code, tests and docs, one step at a
  time; I reviewed and approved each step before it landed.

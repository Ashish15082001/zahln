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
  domain/      Shapes, money, payment state machine. No React, no DOM.
  api/         HTTP client: deadlines, retries, idempotency, response parsing
  i18n/        i18next setup and the de/en strings
  ui/          Accessible components shared by all three surfaces
  native/      Capacitor wrappers, used by the student app and the till only
docs/
  design.md    Design document
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

_Written as the work lands._

## What I left out, and why

_Written as the work lands._

## AI tools

- **Claude Code (Anthropic):** monorepo scaffold and tooling configuration.

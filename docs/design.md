# Design document

## Architecture and what is shared

_To be written._

## How a payment moves through its states

_To be written: on the phone and on the till, including when things go wrong._

## Shipping releases for an app that cannot be hotfixed

_To be written: minimum app version, switching payments off, staged rollout._

## Security and data protection on the device

_To be written._

## Technology choices, and what I would change about yours

Decisions made so far, to expand:

- **Capacitor instead of React Native with Expo.** Cleared with Zahln before
  starting. All three surfaces render the same DOM, so UI components are shared
  as well as types and the API client, and TalkBack works with semantic HTML.
  The cost is WebView performance on a low-end Android phone.
- **TypeScript 6.0, not 7.** typescript-eslint supports TypeScript below 6.1,
  and type-aware lint rules such as `no-floating-promises` catch an un-awaited
  payment call.
- **ESLint 9, not 10.** eslint-plugin-jsx-a11y does not yet support ESLint 10,
  and accessibility lint matters for the screen-reader requirement.
- **Flat `node_modules` (`nodeLinker: hoisted`).** Capacitor's Gradle files
  reach native plugins through `node_modules` paths.
- **`@capgo/capacitor-native-biometric` for the check before Pay.** It is
  free on public npm, supports Capacitor 8, is kept up to date, and can also
  keep secrets in the Android Keystore, which the till's re-login will need.
  Capawesome's Biometrics plugin has a nicer API but needs a paid licence and
  a private npm registry, so a clone of this public repo wouldn't install.
  `@aparajita/capacitor-biometric-auth` can't store secrets. Two of the
  plugin's Android defaults are worked around in `packages/native`: the PIN
  is offered only when `DEVICE_CREDENTIAL` is in `allowedBiometryTypes` (its
  `useFallback` option is ignored there), and `maxAttempts` is raised from 1
  to Android's maximum of 5, or one misread finger would end the check.
- **A sticky header and footer, with the window scrolling.** Both apps build
  every screen on `ScreenLayoutJSX` in `packages/ui`. Scrolling only the
  content between a fixed header and footer was ruled out: React Router
  restores only the window's scroll, so Back from a payment would land at the
  top of the list. Sticky, not fixed, so a footer that grows, such as Pay
  with a message above it, never covers the end of the content. The header
  pads by the status bar and the footer by the nav bar, so the page is the
  screen's height and their background covers content scrolling under the
  bars.
- **Till orientation.** The till is locked to landscape, but Android 16 ignores
  that lock on tablets for apps targeting API 36, so its layout must also work
  in portrait.

## What the API is missing, and what I would change

See [api-gaps.md](api-gaps.md).

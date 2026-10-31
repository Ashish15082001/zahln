// English is the source of truth for keys. No `as const`, so every leaf types
// as `string` and de.ts can be held to the same shape without matching text.
const en = {
  common: {
    continue: "Continue",
    version: "Version {{version}}",
  },
  student: {
    appName: "Zahln",
  },
  till: {
    appName: "Zahln Till",
    welcome: {
      title: "Welcome to Zahln",
      description: "Ring up orders and take payments at the mensa.",
    },
    login: {
      title: "Log in",
      description: "Log in with your cashier account.",
      username: "Username",
      password: "Password",
      submit: "Log in",
      submitting: "Logging in…",
      errors: {
        wrongPassword: "Wrong username or password.",
        notCashier: "This account can't use the till.",
        unreachable: "Can't reach the server. Try again.",
        badCandidate: "This build has a wrong candidate ID.",
        unknown: "Something went wrong. Try again.",
      },
    },
    home: {
      title: "Signed in",
      signedInAs: "Logged in as {{name}}",
      logOut: "Log out",
    },
  },
  dashboard: {
    appName: "Zahln Dashboard",
  },
};

export type Resources = typeof en;

export default en;

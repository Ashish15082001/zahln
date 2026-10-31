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
      greeting: "Hello, {{name}}",
      logOut: "Log out",
      tabs: {
        mensa: "Mensa",
        orders: "Orders",
      },
      mensa: {
        loading: "Loading the menu…",
        error: "The menu couldn't be loaded.",
        retry: "Try again",
        retrying: "Trying again…",
        notFound: "Your mensa isn't on the server's list.",
        emptyMenu: "No dishes on the menu.",
        dish: "Dish",
        student: "Student",
        staff: "Staff",
        guest: "Guest",
        selectAll: "Select all dishes",
        selectDish: "Select {{dish}}",
        quantity: "Quantity",
        oneMore: "One more {{dish}}",
        oneFewer: "One fewer {{dish}}",
        createOrder: "Create order",
      },
      orders: {
        comingSoon: "Orders will show here.",
      },
    },
  },
  dashboard: {
    appName: "Zahln Dashboard",
  },
};

export type Resources = typeof en;

export default en;

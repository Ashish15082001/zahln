// One place for the dashboard's routes, so a link and its route can't drift
// apart.
export const paths = {
  login: "/login",
  // The first thing finance sees after logging in.
  dailyTotals: "/",
  payments: "/payments",
} as const;

import { generatePath } from "react-router";

// One place for the dashboard's routes, so a link and its route can't drift
// apart.
export const paths = {
  login: "/login",
  // The first thing finance sees after logging in.
  dailyTotals: "/",
  attention: "/attention",
  payments: "/payments",
  payment: "/payments/:paymentId",
} as const;

/**
 * The detail screen of one payment. generatePath escapes the id, so an odd
 * character in it can't change which screen the link opens.
 */
export const toPaymentPath = (paymentId: string): string =>
  generatePath(paths.payment, { paymentId });

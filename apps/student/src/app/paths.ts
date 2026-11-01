import { generatePath } from "react-router";

// One place for the student app's routes, so a link and its route can't drift
// apart.
export const paths = {
  welcome: "/",
  login: "/login",
  home: "/home",
  payment: "/payments/:paymentId",
  // Read only, with no Pay. Nothing links here yet.
  order: "/orders/:orderId",
  // Named after the QR's zahln://pay?order=…, which is what opens it.
  pay: "/pay/:orderId",
  scan: "/scan",
  profile: "/profile",
} as const;

/**
 * The detail screen of one payment. generatePath escapes the id, so an odd
 * character in it can't change which screen the link opens.
 */
export const toPaymentPath = (paymentId: string): string =>
  generatePath(paths.payment, { paymentId });

/** Where a scanned order is paid. Escapes the id, like above. */
export const toPayPath = (orderId: string): string =>
  generatePath(paths.pay, { orderId });

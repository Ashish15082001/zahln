import { createPayIntentStore } from "@zahln/api/payIntentStore";

/**
 * The payment being made, kept in memory until the server answers it. Here
 * rather than in pay.ts so Log out can forget it without importing pay.ts,
 * which imports session.ts.
 */
export const payIntentStore = createPayIntentStore();

import type { SessionRequest } from "@zahln/domain/user/backend";
import type { PriceGroup } from "@zahln/domain/user/frontend";

/** A payer login the server is seeded with. */
export interface TestUser {
  credentials: SessionRequest;
  priceGroup: PriceGroup;
}

// The seeded password, the same for every login and printed in the API's own
// docs, so it is no secret. The server has no payers but these three, which
// is why the login screen offers them instead of a username and password form.
const SEEDED_PASSWORD = "test1234";

/**
 * One payer per price group. The same order costs each of them a different
 * amount, so logging in as each in turn shows all three prices.
 */
export const TEST_USERS: TestUser[] = [
  {
    credentials: { username: "student", password: SEEDED_PASSWORD },
    priceGroup: "student",
  },
  {
    credentials: { username: "staff", password: SEEDED_PASSWORD },
    priceGroup: "staff",
  },
  {
    credentials: { username: "guest", password: SEEDED_PASSWORD },
    priceGroup: "guest",
  },
];

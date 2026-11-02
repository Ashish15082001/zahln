import type { SessionRequest } from "@zahln/domain/user/backend";

/**
 * The one finance login the server is seeded with. Its password is printed
 * in the API's own docs, so it is no secret, and there is no other finance
 * user to type in, which is why the login screen offers this one instead of
 * a username and password form.
 */
export const FINANCE_TEST_USER: SessionRequest = {
  username: "finance",
  password: "test1234",
};

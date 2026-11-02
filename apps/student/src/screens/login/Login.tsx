import type { PriceGroup } from "@zahln/domain/user/frontend";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { loginErrorReason } from "../../data/loginError";
import { useLogin } from "../../data/session";
import { TEST_USERS } from "../../data/testUsers";
import type { LoginStatus, TestUserOption } from "./content/LoginContentJSX";
import LoginJSX from "./LoginJSX";

const Login: FC = () => {
  const { t } = useTranslation("student");
  // Success needs no navigate() call in the click handler: the session
  // changes, and SignedOutOnly around this screen redirects to Home.
  const login = useLogin();

  let status: LoginStatus = "idle";
  if (login.isPending) status = "submitting";
  else if (login.isError) status = "error";

  const errorReason = login.isError ? loginErrorReason(login.error) : null;
  // Whose card was tapped, read from the login being sent rather than kept
  // in a state of its own, so it can't outlive that login.
  const loggingInUsername = login.isPending ? login.variables.username : null;

  const testUserOptions: TestUserOption[] = TEST_USERS.map((testUser) => ({
    description: t(`login.testUsers.${testUser.priceGroup}.description`),
    isLoggingIn: testUser.credentials.username === loggingInUsername,
    priceGroup: testUser.priceGroup,
    title: t(`login.testUsers.${testUser.priceGroup}.title`),
  }));

  const handleLogIn = (priceGroup: PriceGroup): void => {
    const testUser = TEST_USERS.find(
      (candidate) => candidate.priceGroup === priceGroup,
    );
    if (testUser) login.mutate(testUser.credentials);
  };

  return (
    <LoginJSX
      errorReason={errorReason}
      status={status}
      testUserOptions={testUserOptions}
      handleLogIn={handleLogIn}
    />
  );
};

export default Login;

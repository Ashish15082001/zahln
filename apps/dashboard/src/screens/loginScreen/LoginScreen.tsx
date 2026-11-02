import type { FC } from "react";
import { loginErrorReason } from "../../data/loginError";
import { useLogin } from "../../data/session";
import { FINANCE_TEST_USER } from "../../data/testUsers";
import type { LoginStatus } from "./loginContent/LoginContent";
import LoginScreenJSX from "./LoginScreenJSX";

const LoginScreen: FC = () => {
  // Success needs no navigate() call in the click handler: the session
  // changes, and SignedOutOnly around this screen redirects to the daily
  // totals.
  const login = useLogin();

  let status: LoginStatus = "idle";
  if (login.isPending) status = "submitting";
  else if (login.isError) status = "error";

  const errorReason = login.isError ? loginErrorReason(login.error) : null;

  const handleLogIn = (): void => login.mutate(FINANCE_TEST_USER);

  return (
    <LoginScreenJSX
      errorReason={errorReason}
      status={status}
      handleLogIn={handleLogIn}
    />
  );
};

export default LoginScreen;

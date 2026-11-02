import { useState, type FC, type FormEvent } from "react";
import { loginErrorReason } from "../../data/loginError";
import { useLogin } from "../../data/session";
import type { LoginStatus } from "./loginContent/LoginContent";
import LoginScreenJSX from "./LoginScreenJSX";

const LoginScreen: FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // Success needs no navigate() call in the submit handler: the session
  // changes, and SignedOutOnly around this screen redirects to Home.
  const login = useLogin();

  let status: LoginStatus = "idle";
  if (login.isPending) status = "submitting";
  else if (login.isError) status = "error";

  const errorReason = login.isError ? loginErrorReason(login.error) : null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    // Without this the browser reloads the page and the WebView starts over.
    event.preventDefault();
    login.mutate({ username: username.trim(), password });
  };

  return (
    <LoginScreenJSX
      errorReason={errorReason}
      password={password}
      status={status}
      username={username}
      handleChangePassword={setPassword}
      handleChangeUsername={setUsername}
      handleSubmit={handleSubmit}
    />
  );
};

export default LoginScreen;

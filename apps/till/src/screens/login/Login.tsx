import { useState, type FC, type FormEvent } from "react";
import { Navigate } from "react-router";
import { paths } from "../../app/paths";
import { loginErrorReason } from "../../data/loginError";
import { useLogin, useSession } from "../../data/session";
import LoginJSX, { type LoginStatus } from "./LoginJSX";

const Login: FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const session = useSession();
  const login = useLogin();

  // Success needs no navigate() call in the submit handler: the session
  // changes, this screen re-renders, and the redirect happens here.
  if (session.status === "signedIn") {
    return <Navigate replace to={paths.home} />;
  }

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
    <LoginJSX
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

export default Login;

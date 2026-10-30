import { useState, type FC, type FormEvent } from "react";
import LoginJSX from "./LoginJSX";

const Login: FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    // Without this the browser reloads the page and the WebView starts over.
    event.preventDefault();
    // Static screen for now: logging in is wired to the session in piece 5
    // of docs/till-plan.md.
  };

  return (
    <LoginJSX
      password={password}
      username={username}
      handleChangePassword={setPassword}
      handleChangeUsername={setUsername}
      handleSubmit={handleSubmit}
    />
  );
};

export default Login;

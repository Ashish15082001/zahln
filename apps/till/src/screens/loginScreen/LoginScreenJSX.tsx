import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import type { FC, FormEvent } from "react";
import type { LoginErrorReason } from "../../data/loginError";
import LoginContent, { type LoginStatus } from "./loginContent/LoginContent";

export interface LoginScreenJSXProps {
  errorReason: LoginErrorReason | null;
  password: string;
  status: LoginStatus;
  username: string;
  handleChangePassword: (password: string) => void;
  handleChangeUsername: (username: string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const LoginScreenJSX: FC<LoginScreenJSXProps> = ({
  errorReason,
  password,
  status,
  username,
  handleChangePassword,
  handleChangeUsername,
  handleSubmit,
}) => (
  <ScreenLayoutJSX
    columnWidth="md"
    content={
      <LoginContent
        errorReason={errorReason}
        password={password}
        status={status}
        username={username}
        handleChangePassword={handleChangePassword}
        handleChangeUsername={handleChangeUsername}
        handleSubmit={handleSubmit}
      />
    }
    contentClassName="items-center justify-center"
  />
);

export default LoginScreenJSX;

import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import type { FC } from "react";
import type { LoginErrorReason } from "../../data/loginError";
import LoginContent, { type LoginStatus } from "./loginContent/LoginContent";

export interface LoginScreenJSXProps {
  errorReason: LoginErrorReason | null;
  status: LoginStatus;
  handleLogIn: () => void;
}

const LoginScreenJSX: FC<LoginScreenJSXProps> = ({
  errorReason,
  status,
  handleLogIn,
}) => (
  <ScreenLayoutJSX
    columnWidth="md"
    content={
      <LoginContent
        errorReason={errorReason}
        status={status}
        handleLogIn={handleLogIn}
      />
    }
    contentClassName="justify-center"
  />
);

export default LoginScreenJSX;

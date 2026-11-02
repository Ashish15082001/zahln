import type { FC } from "react";
import type { LoginErrorReason } from "../../../data/loginError";
import LoginContentJSX from "./LoginContentJSX";

export type LoginStatus = "idle" | "submitting" | "error";

export interface LoginContentProps {
  errorReason: LoginErrorReason | null;
  status: LoginStatus;
  handleLogIn: () => void;
}

const LoginContent: FC<LoginContentProps> = ({
  errorReason,
  status,
  handleLogIn,
}) => {
  const isSubmitting = status === "submitting";

  return (
    <LoginContentJSX
      errorReason={errorReason}
      isSubmitting={isSubmitting}
      handleLogIn={handleLogIn}
    />
  );
};

export default LoginContent;

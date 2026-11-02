import type { FC, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { LoginErrorReason } from "../../../data/loginError";
import LoginContentJSX from "./LoginContentJSX";

export type LoginStatus = "idle" | "submitting" | "error";

export interface LoginContentProps {
  errorReason: LoginErrorReason | null;
  password: string;
  status: LoginStatus;
  username: string;
  handleChangePassword: (password: string) => void;
  handleChangeUsername: (username: string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const LoginContent: FC<LoginContentProps> = ({
  errorReason,
  password,
  status,
  username,
  handleChangePassword,
  handleChangeUsername,
  handleSubmit,
}) => {
  const { t } = useTranslation("till");

  const isSubmitting = status === "submitting";
  const submitLabel = isSubmitting ? t("login.submitting") : t("login.submit");

  return (
    <LoginContentJSX
      errorReason={errorReason}
      isSubmitting={isSubmitting}
      password={password}
      submitLabel={submitLabel}
      username={username}
      handleChangePassword={handleChangePassword}
      handleChangeUsername={handleChangeUsername}
      handleSubmit={handleSubmit}
    />
  );
};

export default LoginContent;

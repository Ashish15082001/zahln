import { Alert, AlertTitle } from "@zahln/ui/components/alert";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import type { LoginErrorReason } from "../../../data/loginError";
import TestUserItem from "../components/testUserItem/TestUserItem";

export interface LoginContentJSXProps {
  errorReason: LoginErrorReason | null;
  isSubmitting: boolean;
  handleLogIn: () => void;
}

const LoginContentJSX: FC<LoginContentJSXProps> = ({
  errorReason,
  isSubmitting,
  handleLogIn,
}) => {
  const { t } = useTranslation("dashboard");

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{t("login.title")}</h1>
        <p className="text-muted-foreground">{t("login.description")}</p>
      </div>
      {/* Alerts have role="alert", so a screen reader reads them out as soon
          as they appear. */}
      {errorReason !== null && (
        <Alert variant="destructive">
          <AlertTitle>{t(`login.errors.${errorReason}`)}</AlertTitle>
        </Alert>
      )}
      <TestUserItem isLoggingIn={isSubmitting} handleLogIn={handleLogIn} />
    </>
  );
};

export default LoginContentJSX;

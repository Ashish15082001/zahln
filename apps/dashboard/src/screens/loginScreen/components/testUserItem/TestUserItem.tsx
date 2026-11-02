import type { FC } from "react";
import { useTranslation } from "react-i18next";
import TestUserItemJSX from "./TestUserItemJSX";

export interface TestUserItemProps {
  // The login is on its way.
  isLoggingIn: boolean;
  handleLogIn: () => void;
}

const TestUserItem: FC<TestUserItemProps> = ({ isLoggingIn, handleLogIn }) => {
  const { t } = useTranslation("dashboard");

  const buttonLabel = isLoggingIn ? t("login.submitting") : t("login.submit");

  return (
    <TestUserItemJSX
      buttonLabel={buttonLabel}
      description={t("login.financeUser.description")}
      // Off while the login is on its way, so a second click can't start a
      // second login.
      isDisabled={isLoggingIn}
      title={t("login.financeUser.title")}
      handleLogIn={handleLogIn}
    />
  );
};

export default TestUserItem;

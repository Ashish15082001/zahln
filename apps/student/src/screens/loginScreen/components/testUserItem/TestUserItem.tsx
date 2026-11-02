import type { FC } from "react";
import { useTranslation } from "react-i18next";
import TestUserItemJSX from "./TestUserItemJSX";

export interface TestUserItemProps {
  description: string;
  isDisabled: boolean;
  // This card's login is the one on its way.
  isLoggingIn: boolean;
  title: string;
  handleLogIn: () => void;
}

const TestUserItem: FC<TestUserItemProps> = ({
  description,
  isDisabled,
  isLoggingIn,
  title,
  handleLogIn,
}) => {
  const { t } = useTranslation("student");

  const buttonLabel = isLoggingIn ? t("login.submitting") : t("login.submit");

  return (
    <TestUserItemJSX
      buttonLabel={buttonLabel}
      description={description}
      isDisabled={isDisabled}
      title={title}
      handleLogIn={handleLogIn}
    />
  );
};

export default TestUserItem;

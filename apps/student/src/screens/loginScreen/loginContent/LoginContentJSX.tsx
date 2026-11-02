import type { PriceGroup } from "@zahln/domain/user/frontend";
import { Alert, AlertTitle } from "@zahln/ui/components/alert";
import { ItemGroup } from "@zahln/ui/components/item";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import type { LoginErrorReason } from "../../../data/loginError";
import TestUserItem from "../components/testUserItem/TestUserItem";

/** One seeded payer's card, ready to show. */
export interface TestUserOption {
  description: string;
  isLoggingIn: boolean;
  priceGroup: PriceGroup;
  title: string;
}

export interface LoginContentJSXProps {
  errorReason: LoginErrorReason | null;
  isSubmitting: boolean;
  testUserOptions: TestUserOption[];
  handleLogIn: (priceGroup: PriceGroup) => void;
}

const LoginContentJSX: FC<LoginContentJSXProps> = ({
  errorReason,
  isSubmitting,
  testUserOptions,
  handleLogIn,
}) => {
  const { t } = useTranslation("student");

  return (
    <>
      {/* No Card around it, as there was around the form: the users are
          cards already, and a card of cards is a box too many. */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{t("login.title")}</h1>
        <p className="text-muted-foreground">{t("login.description")}</p>
      </div>
      {/* Alerts have role="alert", so TalkBack reads them out as soon as
          they appear. */}
      {errorReason !== null && (
        <Alert variant="destructive">
          <AlertTitle>{t(`login.errors.${errorReason}`)}</AlertTitle>
        </Alert>
      )}
      <ItemGroup>
        {testUserOptions.map((option) => (
          <TestUserItem
            key={option.priceGroup}
            description={option.description}
            // Every card's button is off while one logs in, so a second tap
            // can't start a second login.
            isDisabled={isSubmitting}
            isLoggingIn={option.isLoggingIn}
            title={option.title}
            handleLogIn={() => handleLogIn(option.priceGroup)}
          />
        ))}
      </ItemGroup>
    </>
  );
};

export default LoginContentJSX;

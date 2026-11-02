import type { PriceGroup } from "@zahln/domain/user/frontend";
import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import type { FC } from "react";
import type { LoginErrorReason } from "../../data/loginError";
import LoginContent, { type LoginStatus } from "./loginContent/LoginContent";
import type { TestUserOption } from "./loginContent/LoginContentJSX";

export interface LoginScreenJSXProps {
  errorReason: LoginErrorReason | null;
  status: LoginStatus;
  testUserOptions: TestUserOption[];
  handleLogIn: (priceGroup: PriceGroup) => void;
}

const LoginScreenJSX: FC<LoginScreenJSXProps> = ({
  errorReason,
  status,
  testUserOptions,
  handleLogIn,
}) => (
  <ScreenLayoutJSX
    columnWidth="md"
    content={
      <LoginContent
        errorReason={errorReason}
        status={status}
        testUserOptions={testUserOptions}
        handleLogIn={handleLogIn}
      />
    }
    contentClassName="justify-center"
  />
);

export default LoginScreenJSX;

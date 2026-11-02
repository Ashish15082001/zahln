import type { PriceGroup } from "@zahln/domain/user/frontend";
import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import type { FC } from "react";
import type { LoginErrorReason } from "../../data/loginError";
import LoginContentJSX, {
  type LoginStatus,
  type TestUserOption,
} from "./content/LoginContentJSX";

export interface LoginJSXProps {
  errorReason: LoginErrorReason | null;
  status: LoginStatus;
  testUserOptions: TestUserOption[];
  handleLogIn: (priceGroup: PriceGroup) => void;
}

const LoginJSX: FC<LoginJSXProps> = ({
  errorReason,
  status,
  testUserOptions,
  handleLogIn,
}) => (
  <ScreenLayoutJSX
    columnWidth="md"
    content={
      <LoginContentJSX
        errorReason={errorReason}
        status={status}
        testUserOptions={testUserOptions}
        handleLogIn={handleLogIn}
      />
    }
    contentClassName="justify-center"
  />
);

export default LoginJSX;

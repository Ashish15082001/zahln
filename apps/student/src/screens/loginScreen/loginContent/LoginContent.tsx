import type { PriceGroup } from "@zahln/domain/user/frontend";
import type { FC } from "react";
import type { LoginErrorReason } from "../../../data/loginError";
import LoginContentJSX, { type TestUserOption } from "./LoginContentJSX";

export type LoginStatus = "idle" | "submitting" | "error";

export interface LoginContentProps {
  errorReason: LoginErrorReason | null;
  status: LoginStatus;
  testUserOptions: TestUserOption[];
  handleLogIn: (priceGroup: PriceGroup) => void;
}

const LoginContent: FC<LoginContentProps> = ({
  errorReason,
  status,
  testUserOptions,
  handleLogIn,
}) => {
  const isSubmitting = status === "submitting";

  return (
    <LoginContentJSX
      errorReason={errorReason}
      isSubmitting={isSubmitting}
      testUserOptions={testUserOptions}
      handleLogIn={handleLogIn}
    />
  );
};

export default LoginContent;

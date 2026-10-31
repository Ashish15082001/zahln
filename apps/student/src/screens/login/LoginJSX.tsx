import { Alert, AlertTitle } from "@zahln/ui/components/alert";
import { Button } from "@zahln/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@zahln/ui/components/card";
import { Input } from "@zahln/ui/components/input";
import { Label } from "@zahln/ui/components/label";
import { useId, type FC, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { LoginErrorReason } from "../../data/loginError";

export type LoginStatus = "idle" | "submitting" | "error";

export interface LoginJSXProps {
  errorReason: LoginErrorReason | null;
  password: string;
  status: LoginStatus;
  username: string;
  handleChangePassword: (password: string) => void;
  handleChangeUsername: (username: string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const LoginJSX: FC<LoginJSXProps> = ({
  errorReason,
  password,
  status,
  username,
  handleChangePassword,
  handleChangeUsername,
  handleSubmit,
}) => {
  const { t } = useTranslation("student");
  const usernameId = useId();
  const passwordId = useId();
  const isSubmitting = status === "submitting";

  return (
    <main className="flex min-h-svh flex-col items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          {/* CardTitle is a div, so the h1 inside gives the screen a heading
              TalkBack can jump to. It inherits the title's styling. */}
          <CardTitle className="text-2xl">
            <h1>{t("login.title")}</h1>
          </CardTitle>
          <CardDescription>{t("login.description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Alerts have role="alert", so TalkBack reads them out as soon as
              they appear. */}
          {errorReason !== null && (
            <Alert variant="destructive">
              <AlertTitle>{t(`login.errors.${errorReason}`)}</AlertTitle>
            </Alert>
          )}
          {/* A real form, so the keyboard's Enter key submits it. */}
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor={usernameId}>{t("login.username")}</Label>
              {/* Android keyboards capitalise the first letter by default,
                  and usernames are lowercase. */}
              <Input
                autoCapitalize="none"
                autoComplete="username"
                disabled={isSubmitting}
                id={usernameId}
                required
                spellCheck={false}
                value={username}
                onChange={(event) => handleChangeUsername(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={passwordId}>{t("login.password")}</Label>
              <Input
                autoComplete="current-password"
                disabled={isSubmitting}
                id={passwordId}
                required
                type="password"
                value={password}
                onChange={(event) => handleChangePassword(event.target.value)}
              />
            </div>
            {/* Disabled while sending, so a second tap can't start a second
                login. */}
            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? t("login.submitting") : t("login.submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default LoginJSX;

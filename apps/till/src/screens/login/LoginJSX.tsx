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

export interface LoginJSXProps {
  password: string;
  username: string;
  handleChangePassword: (password: string) => void;
  handleChangeUsername: (username: string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const LoginJSX: FC<LoginJSXProps> = ({
  password,
  username,
  handleChangePassword,
  handleChangeUsername,
  handleSubmit,
}) => {
  const { t } = useTranslation("till");
  const usernameId = useId();
  const passwordId = useId();

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
        <CardContent>
          {/* A real form, so the keyboard's Enter key submits it. */}
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor={usernameId}>{t("login.username")}</Label>
              {/* Android keyboards capitalise the first letter by default,
                  and usernames are lowercase. */}
              <Input
                autoCapitalize="none"
                autoComplete="username"
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
                id={passwordId}
                required
                type="password"
                value={password}
                onChange={(event) => handleChangePassword(event.target.value)}
              />
            </div>
            <Button className="w-full" type="submit">
              {t("login.submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default LoginJSX;

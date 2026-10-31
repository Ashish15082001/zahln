import { Button } from "@zahln/ui/components/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@zahln/ui/components/card";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { paths } from "../../app/paths";

export interface WelcomeJSXProps {
  appVersion: string;
}

const WelcomeJSX: FC<WelcomeJSXProps> = ({ appVersion }) => {
  const { t } = useTranslation(["student", "common"]);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          {/* CardTitle is a div, so the h1 inside gives the screen a heading
              TalkBack can jump to. It inherits the title's styling. */}
          <CardTitle className="text-2xl">
            <h1>{t("welcome.title")}</h1>
          </CardTitle>
          <CardDescription>{t("welcome.description")}</CardDescription>
        </CardHeader>
        <CardFooter>
          {/* A link styled as a button, not a button with a click handler:
              Continue goes to another screen, and TalkBack says so. */}
          <Button asChild className="w-full">
            <Link to={paths.login}>{t("common:continue")}</Link>
          </Button>
        </CardFooter>
      </Card>
      <p className="text-sm text-muted-foreground">
        {t("common:version", { version: appVersion })}
      </p>
    </main>
  );
};

export default WelcomeJSX;

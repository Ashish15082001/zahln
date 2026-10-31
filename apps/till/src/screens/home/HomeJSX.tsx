import { Button } from "@zahln/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@zahln/ui/components/card";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

export interface HomeJSXProps {
  displayName: string;
  handleLogOut: () => void;
}

const HomeJSX: FC<HomeJSXProps> = ({ displayName, handleLogOut }) => {
  const { t } = useTranslation("till");

  return (
    <main className="flex min-h-svh flex-col items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          {/* CardTitle is a div, so the h1 inside gives the screen a heading
              TalkBack can jump to. */}
          <CardTitle className="text-2xl">
            <h1>{t("home.title")}</h1>
          </CardTitle>
          <CardDescription>
            {t("home.signedInAs", { name: displayName })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" variant="outline" onClick={handleLogOut}>
            {t("home.logOut")}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
};

export default HomeJSX;

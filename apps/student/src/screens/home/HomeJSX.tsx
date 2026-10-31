import { Button } from "@zahln/ui/components/button";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import PaymentList from "./paymentList/PaymentList";
import ScanFooter from "./scanFooter/ScanFooter";

export interface HomeJSXProps {
  displayName: string;
  handleLogOut: () => void;
}

const HomeJSX: FC<HomeJSXProps> = ({ displayName, handleLogOut }) => {
  const { t } = useTranslation("student");

  return (
    <>
      {/* pb-28 keeps the end of the list, e.g. Load more, clear of the fixed
          footer: its 48 px button plus padding, with room to spare. */}
      <main className="mx-auto flex min-h-svh w-full max-w-md flex-col p-6 pb-28">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">
            {t("home.greeting", { name: displayName })}
          </h1>
          <Button variant="outline" onClick={handleLogOut}>
            {t("home.logOut")}
          </Button>
        </div>
        <PaymentList />
      </main>
      <ScanFooter />
    </>
  );
};

export default HomeJSX;

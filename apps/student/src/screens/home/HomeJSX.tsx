import { Button } from "@zahln/ui/components/button";
import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
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

  const header = (
    <div className="flex items-center justify-between gap-4">
      <h1 className="text-2xl font-semibold">
        {t("home.greeting", { name: displayName })}
      </h1>
      <Button variant="outline" onClick={handleLogOut}>
        {t("home.logOut")}
      </Button>
    </div>
  );

  return (
    <ScreenLayoutJSX columnWidth="md" footer={<ScanFooter />} header={header}>
      <PaymentList />
    </ScreenLayoutJSX>
  );
};

export default HomeJSX;

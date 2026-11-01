import { UserCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@zahln/ui/components/button";
import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { paths } from "../../app/paths";
import PaymentList from "./paymentList/PaymentList";
import ScanFooter from "./scanFooter/ScanFooter";

export interface HomeJSXProps {
  displayName: string;
}

const HomeJSX: FC<HomeJSXProps> = ({ displayName }) => {
  const { t } = useTranslation("student");

  const header = (
    <div className="flex items-center justify-between gap-4">
      <h1 className="text-2xl font-semibold">
        {t("home.greeting", { name: displayName })}
      </h1>
      {/* A link styled as a button: it opens another screen, and TalkBack
          says so. An icon only, so the label names it. */}
      <Button asChild size="icon" variant="outline">
        <Link aria-label={t("home.profile")} to={paths.profile}>
          <HugeiconsIcon aria-hidden icon={UserCircleIcon} />
        </Link>
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

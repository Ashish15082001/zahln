import { Download04Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@zahln/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@zahln/ui/components/empty";
import type { FC, Ref } from "react";
import { useTranslation } from "react-i18next";

export interface UpdateContentJSXProps {
  appUpdateUrl: string;
  headingRef: Ref<HTMLHeadingElement>;
  // e.g. "You have 1.0.0. Zahln needs 1.2.0 or later."
  versionsText: string;
}

const UpdateContentJSX: FC<UpdateContentJSXProps> = ({
  appUpdateUrl,
  headingRef,
  versionsText,
}) => {
  const { t } = useTranslation("student");

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon aria-hidden icon={Download04Icon} />
        </EmptyMedia>
        {/* EmptyTitle is a div; the h1 inside gives the screen its heading.
            tabIndex -1 so focus can move here; it isn't in the Tab order. */}
        <EmptyTitle>
          <h1 ref={headingRef} className="outline-none" tabIndex={-1}>
            {t("update.title")}
          </h1>
        </EmptyTitle>
        <EmptyDescription>{t("update.description")}</EmptyDescription>
        <EmptyDescription>{versionsText}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {/* A link, not a button: it leaves the app. The WebView hands a
            link to another site to the phone's browser, and Chrome opens a
            new tab. */}
        <Button asChild>
          <a href={appUpdateUrl} rel="noreferrer" target="_blank">
            {t("update.download")}
          </a>
        </Button>
      </EmptyContent>
    </Empty>
  );
};

export default UpdateContentJSX;

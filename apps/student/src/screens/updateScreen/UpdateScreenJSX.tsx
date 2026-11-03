import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import type { FC } from "react";
import UpdateContent from "./updateContent/UpdateContent";

export interface UpdateScreenJSXProps {
  appUpdateUrl: string;
  appVersion: string;
  minAppVersion: string | null;
}

const UpdateScreenJSX: FC<UpdateScreenJSXProps> = ({
  appUpdateUrl,
  appVersion,
  minAppVersion,
}) => (
  <ScreenLayoutJSX
    columnWidth="md"
    content={
      <UpdateContent
        appUpdateUrl={appUpdateUrl}
        appVersion={appVersion}
        minAppVersion={minAppVersion}
      />
    }
    contentClassName="items-center justify-center"
  />
);

export default UpdateScreenJSX;

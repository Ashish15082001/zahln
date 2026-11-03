import type { FC } from "react";
import { config } from "../../config";
import { useAppConfig } from "../../data/appConfig";
import UpdateScreenJSX from "./UpdateScreenJSX";

const UpdateScreen: FC = () => {
  // Always there when this screen shows: only the config can send the app
  // here. Null only satisfies the type.
  const minAppVersion = useAppConfig().data?.minAppVersion ?? null;

  return (
    <UpdateScreenJSX
      appUpdateUrl={config.appUpdateUrl}
      appVersion={config.appVersion}
      minAppVersion={minAppVersion}
    />
  );
};

export default UpdateScreen;

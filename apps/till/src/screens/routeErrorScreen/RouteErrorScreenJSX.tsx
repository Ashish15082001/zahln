import RouteErrorContentJSX from "@zahln/ui/components/routeErrorContent/RouteErrorContentJSX";
import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import type { FC, Ref } from "react";

export interface RouteErrorScreenJSXProps {
  description: string;
  headingRef: Ref<HTMLHeadingElement>;
  reloadLabel: string;
  title: string;
  handleReload: () => void;
}

const RouteErrorScreenJSX: FC<RouteErrorScreenJSXProps> = ({
  description,
  headingRef,
  reloadLabel,
  title,
  handleReload,
}) => (
  <ScreenLayoutJSX
    columnWidth="md"
    content={
      <RouteErrorContentJSX
        description={description}
        headingRef={headingRef}
        reloadLabel={reloadLabel}
        title={title}
        handleReload={handleReload}
      />
    }
    contentClassName="items-center justify-center"
  />
);

export default RouteErrorScreenJSX;

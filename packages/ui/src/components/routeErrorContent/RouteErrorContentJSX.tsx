import { Alert02Icon } from "@hugeicons/core-free-icons";
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

export interface RouteErrorContentJSXProps {
  description: string;
  headingRef: Ref<HTMLHeadingElement>;
  reloadLabel: string;
  title: string;
  handleReload: () => void;
}

/**
 * What a screen shows when it can't open: its file didn't load, or it threw
 * while rendering. The same in all three surfaces, so the words come as props
 * from each app's strings. The caller moves focus to the heading.
 */
const RouteErrorContentJSX: FC<RouteErrorContentJSXProps> = ({
  description,
  headingRef,
  reloadLabel,
  title,
  handleReload,
}) => (
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <HugeiconsIcon aria-hidden icon={Alert02Icon} />
      </EmptyMedia>
      {/* EmptyTitle is a div; the h1 inside gives the screen its heading.
          tabIndex -1 so focus can move here; it isn't in the Tab order. */}
      <EmptyTitle>
        <h1 ref={headingRef} className="outline-none" tabIndex={-1}>
          {title}
        </h1>
      </EmptyTitle>
      <EmptyDescription>{description}</EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Button onClick={handleReload}>{reloadLabel}</Button>
    </EmptyContent>
  </Empty>
);

export default RouteErrorContentJSX;

import { Button } from "@zahln/ui/components/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@zahln/ui/components/item";
import type { FC } from "react";

export interface TestUserItemJSXProps {
  buttonLabel: string;
  description: string;
  isDisabled: boolean;
  title: string;
  handleLogIn: () => void;
}

/**
 * The seeded finance user as a card: who they are, what they see, and a
 * button that logs in as them. A lone card, not a list item as in the
 * student app's picker, since there is no other finance user to list.
 */
const TestUserItemJSX: FC<TestUserItemJSXProps> = ({
  buttonLabel,
  description,
  isDisabled,
  title,
  handleLogIn,
}) => (
  <Item variant="outline">
    <ItemContent>
      <ItemTitle className="text-base">{title}</ItemTitle>
      <ItemDescription>{description}</ItemDescription>
    </ItemContent>
    <ItemActions>
      <Button disabled={isDisabled} type="button" onClick={handleLogIn}>
        {buttonLabel}
      </Button>
    </ItemActions>
  </Item>
);

export default TestUserItemJSX;

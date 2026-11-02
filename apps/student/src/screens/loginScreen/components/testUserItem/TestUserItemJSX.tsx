import { Button } from "@zahln/ui/components/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@zahln/ui/components/item";
import { useId, type FC } from "react";

export interface TestUserItemJSXProps {
  buttonLabel: string;
  description: string;
  isDisabled: boolean;
  title: string;
  handleLogIn: () => void;
}

/**
 * One seeded payer as a card: who they are, which prices they pay, and a
 * button that logs in as them. Goes straight inside an ItemGroup, since it
 * is the group's list item itself.
 */
const TestUserItemJSX: FC<TestUserItemJSXProps> = ({
  buttonLabel,
  description,
  isDisabled,
  title,
  handleLogIn,
}) => {
  const id = useId();
  const titleId = `${id}-title`;
  const buttonId = `${id}-button`;
  // The button's own text, then whose card it is: TalkBack says "Log in,
  // Student". Three buttons all called "Log in" couldn't be told apart in
  // its list of controls.
  const buttonLabelIds = `${buttonId} ${titleId}`;

  return (
    // ItemGroup is a list but leaves its children as plain divs, so each card
    // says it is an item of it.
    <Item role="listitem" variant="outline">
      <ItemContent>
        <ItemTitle className="text-base" id={titleId}>
          {title}
        </ItemTitle>
        <ItemDescription>{description}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          aria-labelledby={buttonLabelIds}
          disabled={isDisabled}
          id={buttonId}
          type="button"
          onClick={handleLogIn}
        >
          {buttonLabel}
        </Button>
      </ItemActions>
    </Item>
  );
};

export default TestUserItemJSX;

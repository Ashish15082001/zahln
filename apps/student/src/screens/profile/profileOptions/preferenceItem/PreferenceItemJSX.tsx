import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@zahln/ui/components/item";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@zahln/ui/components/select";
import { useId, type FC } from "react";

/** One choice in a preference's select. */
export interface PreferenceOption {
  label: string;
  // The language the label is written in, where it isn't the app's own.
  lang: string | undefined;
  value: string;
}

export interface PreferenceItemJSXProps {
  description: string;
  icon: IconSvgElement;
  options: PreferenceOption[];
  selectedValue: string;
  title: string;
  handleChangeValue: (value: string) => void;
}

/**
 * A row of the Profile list with a select at its end: an icon, a title, a
 * line saying what it changes, and the choice. Goes straight inside an
 * ItemGroup, since it is the group's list item itself.
 */
const PreferenceItemJSX: FC<PreferenceItemJSXProps> = ({
  description,
  icon,
  options,
  selectedValue,
  title,
  handleChangeValue,
}) => {
  const id = useId();
  const titleId = `${id}-title`;
  const triggerId = `${id}-trigger`;
  // The title, then the trigger's own text: TalkBack says "App theme, Same
  // as phone". The title alone would leave out the choice, and the trigger
  // alone would say a choice with nothing to say what it is for.
  const triggerLabelIds = `${titleId} ${triggerId}`;

  return (
    // ItemGroup is a list but leaves its children as plain divs, so each row
    // says it is an item of it. Full width with the content's 24 px inside,
    // and square, like the payment rows on Home.
    <Item className="gap-3 rounded-none px-6 py-3" role="listitem">
      <ItemMedia variant="icon">
        <HugeiconsIcon aria-hidden icon={icon} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="text-base" id={titleId}>
          {title}
        </ItemTitle>
        <ItemDescription>{description}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Select value={selectedValue} onValueChange={handleChangeValue}>
          <SelectTrigger aria-labelledby={triggerLabelIds} id={triggerId}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {/* The trigger shows a copy of this, lang and all. */}
                <span lang={option.lang}>{option.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ItemActions>
    </Item>
  );
};

export default PreferenceItemJSX;

import {
  LanguageCircleIcon,
  Logout01Icon,
  PaintBrush02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@zahln/ui/components/item";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import PreferenceItem from "./preferenceItem/PreferenceItem";
import type { PreferenceOption } from "./preferenceItem/PreferenceItemJSX";

export interface ProfileOptionsJSXProps {
  languageOptions: PreferenceOption[];
  selectedLanguage: string;
  selectedTheme: string;
  themeOptions: PreferenceOption[];
  handleChangeLanguage: (value: string) => void;
  handleChangeTheme: (value: string) => void;
  handleLogOut: () => void;
}

const ProfileOptionsJSX: FC<ProfileOptionsJSXProps> = ({
  languageOptions,
  selectedLanguage,
  selectedTheme,
  themeOptions,
  handleChangeLanguage,
  handleChangeTheme,
  handleLogOut,
}) => {
  const { t } = useTranslation("student");

  return (
    // To the screen's edges, so the thin lines between rows run across it,
    // like on Home. No gap: the lines are the space between rows.
    <ItemGroup className="-mx-6 w-auto gap-0">
      <PreferenceItem
        description={t("profile.theme.description")}
        icon={PaintBrush02Icon}
        options={themeOptions}
        selectedValue={selectedTheme}
        title={t("profile.theme.title")}
        handleChangeValue={handleChangeTheme}
      />
      <ItemSeparator className="my-0" />
      <PreferenceItem
        description={t("profile.language.description")}
        icon={LanguageCircleIcon}
        options={languageOptions}
        selectedValue={selectedLanguage}
        title={t("profile.language.title")}
        handleChangeValue={handleChangeLanguage}
      />
      <ItemSeparator className="my-0" />
      {/* The list item is a div around the button: on the button itself,
          role="listitem" would take the place of its button role. */}
      <div role="listitem">
        {/* The whole row is the button, so the tap target is the row and
            TalkBack reads its title and line as one button. */}
        <Item asChild className="gap-3 rounded-none px-6 py-3">
          <button type="button" onClick={handleLogOut}>
            <ItemMedia variant="icon">
              <HugeiconsIcon aria-hidden icon={Logout01Icon} />
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="text-base">
                {t("profile.logOut.title")}
              </ItemTitle>
              <ItemDescription>
                {t("profile.logOut.description")}
              </ItemDescription>
            </ItemContent>
          </button>
        </Item>
      </div>
    </ItemGroup>
  );
};

export default ProfileOptionsJSX;

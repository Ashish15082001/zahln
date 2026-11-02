import { SUPPORTED_LANGUAGES } from "@zahln/i18n/language";
import { useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { logOut } from "../../../../data/session";
import type { PreferenceOption } from "./preferenceItem/PreferenceItemJSX";
import ProfileOptionsJSX from "./ProfileOptionsJSX";

const THEME_CHOICES = ["system", "light", "dark"] as const;
type ThemeChoice = (typeof THEME_CHOICES)[number];

// "device" first: the app follows the phone's language today, so that is
// what is chosen until the payer picks one.
const LANGUAGE_CHOICES = ["device", ...SUPPORTED_LANGUAGES] as const;
type LanguageChoice = (typeof LANGUAGE_CHOICES)[number];

// The select hands back a string. Only these values are in it, but the check
// keeps the state's type honest rather than casting.
const isThemeChoice = (value: string): value is ThemeChoice =>
  (THEME_CHOICES as readonly string[]).includes(value);

const isLanguageChoice = (value: string): value is LanguageChoice =>
  (LANGUAGE_CHOICES as readonly string[]).includes(value);

const ProfileOptions: FC = () => {
  const { t } = useTranslation("student");
  // UI only for now: each select shows the choice, but the app's look and
  // language don't follow it yet. Both start at what the app does today.
  const [selectedTheme, setSelectedTheme] = useState<ThemeChoice>("system");
  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageChoice>("device");

  const themeOptions: PreferenceOption[] = THEME_CHOICES.map((themeChoice) => ({
    label: t(`profile.theme.${themeChoice}`),
    lang: undefined,
    value: themeChoice,
  }));
  const languageOptions: PreferenceOption[] = LANGUAGE_CHOICES.map(
    (languageChoice) => ({
      label: t(`profile.language.${languageChoice}`),
      // Each language is named in itself, "Deutsch" even in the English app,
      // so a German speaker finds it. lang makes TalkBack say it in that
      // language's voice.
      lang: languageChoice === "device" ? undefined : languageChoice,
      value: languageChoice,
    }),
  );

  const handleChangeTheme = (value: string): void => {
    if (isThemeChoice(value)) setSelectedTheme(value);
  };

  const handleChangeLanguage = (value: string): void => {
    if (isLanguageChoice(value)) setSelectedLanguage(value);
  };

  return (
    <ProfileOptionsJSX
      languageOptions={languageOptions}
      selectedLanguage={selectedLanguage}
      selectedTheme={selectedTheme}
      themeOptions={themeOptions}
      handleChangeLanguage={handleChangeLanguage}
      handleChangeTheme={handleChangeTheme}
      handleLogOut={logOut}
    />
  );
};

export default ProfileOptions;

import { Button } from "@zahln/ui/components/button";
import { Input } from "@zahln/ui/components/input";
import { Label } from "@zahln/ui/components/label";
import { useId, type FC, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

export interface SearchFormJSXProps {
  draftQuery: string;
  handleDraftQueryChange: (draftQuery: string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

// The server takes a search of up to 100 characters.
const MAX_QUERY_LENGTH = 100;

/**
 * The search by id: a payment's, an order's or a payer's, or the start of
 * one. A search landmark, so a screen reader can jump straight to it.
 */
const SearchFormJSX: FC<SearchFormJSXProps> = ({
  draftQuery,
  handleDraftQueryChange,
  handleSubmit,
}) => {
  const { t } = useTranslation("dashboard");
  const inputId = useId();

  return (
    <form
      className="flex flex-wrap items-end gap-2"
      role="search"
      onSubmit={handleSubmit}
    >
      <div className="flex min-w-64 flex-1 flex-col gap-1.5">
        <Label htmlFor={inputId}>{t("payments.filters.search")}</Label>
        {/* No autocorrect or capitals: ids are lower case and exact. */}
        <Input
          autoCapitalize="none"
          autoComplete="off"
          id={inputId}
          maxLength={MAX_QUERY_LENGTH}
          placeholder={t("payments.filters.searchPlaceholder")}
          spellCheck={false}
          type="search"
          value={draftQuery}
          onChange={(event) => handleDraftQueryChange(event.target.value)}
        />
      </div>
      <Button type="submit">{t("payments.filters.searchSubmit")}</Button>
    </form>
  );
};

export default SearchFormJSX;

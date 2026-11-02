import { useState, type FC, type FormEvent } from "react";
import SearchFormJSX from "./SearchFormJSX";

export interface SearchFormProps {
  // Read once, when the form mounts: the search in the URL. The parent keys
  // the form by it, so a new search there starts the form again.
  initialQuery: string;
  handleQuerySubmit: (query: string | null) => void;
}

const SearchForm: FC<SearchFormProps> = ({
  initialQuery,
  handleQuerySubmit,
}) => {
  // What is typed, kept here until it is sent, so the list doesn't reload on
  // every key.
  const [draftQuery, setDraftQuery] = useState(initialQuery);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    // The form would otherwise reload the page.
    event.preventDefault();
    const query = draftQuery.trim();
    // Sending an empty field clears the search.
    handleQuerySubmit(query === "" ? null : query);
  };

  return (
    <SearchFormJSX
      draftQuery={draftQuery}
      handleDraftQueryChange={setDraftQuery}
      handleSubmit={handleSubmit}
    />
  );
};

export default SearchForm;

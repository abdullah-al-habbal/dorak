"use client";

import { useUrlState } from "@/hooks/use-url-state";
import { searchFromParams, searchToParams } from "@/lib/service-filters.util";

/** The URL holds the search text, so a link reproduces the list. */
export function useServiceSearch(): { search: string | undefined; setSearch: (search: string | undefined) => void } {
  const { value: search, setValue: setSearch } = useUrlState(searchFromParams, searchToParams);

  return { search, setSearch };
}

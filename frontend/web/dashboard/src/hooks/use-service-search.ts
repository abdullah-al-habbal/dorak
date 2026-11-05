"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { searchFromParams, searchToQuery } from "@/lib/service-filters.util";

/** The URL holds the search text, so a link reproduces the list. */
export function useServiceSearch(): { search: string | undefined; setSearch: (search: string | undefined) => void } {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const search = useMemo(() => searchFromParams(new URLSearchParams(params.toString())), [params]);

  const setSearch = useCallback(
    (next: string | undefined) => {
      const query = searchToQuery(next);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  return { search, setSearch };
}

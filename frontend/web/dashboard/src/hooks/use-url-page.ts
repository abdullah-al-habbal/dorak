"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { withPage } from "@/lib/pagination.util";

/** Returns a setter that moves to a page while keeping every other search param. */
export function useUrlPage(): (page: number) => void {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const search = params.toString();

  return useCallback(
    (page: number) => {
      const query = withPage(search, page);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, search],
  );
}

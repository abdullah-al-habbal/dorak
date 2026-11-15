"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";

import { toReplaceHref } from "@/lib/core/url-query.util";

/** Returns a stable writer that swaps the current history entry's query string, without scrolling. */
export function useReplaceQuery(): (query: string) => void {
  const router = useRouter();
  const pathname = usePathname();

  return useCallback((query: string) => router.replace(toReplaceHref(pathname, query), { scroll: false }), [pathname, router]);
}

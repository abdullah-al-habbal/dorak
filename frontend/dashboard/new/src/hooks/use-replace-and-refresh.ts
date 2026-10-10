"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

/**
 * Auth transitions change server-rendered session state, so every one replaces
 * history and refetches RSC payloads instead of soft-navigating.
 */
export function useReplaceAndRefresh() {
  const router = useRouter();

  return useCallback(
    (href: string) => {
      router.replace(href);
      router.refresh();
    },
    [router],
  );
}

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { rangeFromParams, rangeToParams } from "@/lib/earnings-range.util";
import type { EarningsRange } from "@/types/earnings-range.type";

/** The URL holds the period, so a link or reload reproduces the screen. */
export function useEarningsRange(): { range: EarningsRange; today: Date; setRange: (range: EarningsRange) => void } {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const today = useMemo(() => new Date(), []);
  const range = useMemo(() => rangeFromParams(new URLSearchParams(params.toString()), today), [params, today]);

  const setRange = useCallback(
    (next: EarningsRange) => {
      const query = rangeToParams(next, today).toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, today],
  );

  return { range, today, setRange };
}

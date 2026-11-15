"use client";

import { useCallback, useMemo } from "react";

import { useUrlState } from "@/hooks/core/state/use-url-state";
import { rangeFromParams, rangeToParams } from "@/lib/earnings/earnings-range.util";
import type { EarningsRange } from "@/types/earnings/earnings-range.type";

/** The URL holds the period, so a link or reload reproduces the screen. */
export function useEarningsRange(): { range: EarningsRange; today: Date; setRange: (range: EarningsRange) => void } {
  const today = useMemo(() => new Date(), []);
  const fromParams = useCallback((params: URLSearchParams) => rangeFromParams(params, today), [today]);
  const toParams = useCallback((range: EarningsRange) => rangeToParams(range, today), [today]);
  const { value: range, setValue: setRange } = useUrlState(fromParams, toParams);

  return { range, today, setRange };
}

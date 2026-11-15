"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { useReplaceQuery } from "@/hooks/core/query/use-replace-query";

/**
 * The URL is the source of truth: parse a value from it and write a whole value back.
 * Pass stable `fromParams`/`toParams` (module functions, or `useCallback`), so `setValue` keeps its identity.
 */
export function useUrlState<S>(
  fromParams: (params: URLSearchParams) => S,
  toParams: (value: S) => URLSearchParams,
): { value: S; setValue: (value: S) => void } {
  const params = useSearchParams();
  const replaceQuery = useReplaceQuery();
  const value = useMemo(() => fromParams(new URLSearchParams(params.toString())), [fromParams, params]);
  const setValue = useCallback((next: S) => replaceQuery(toParams(next).toString()), [replaceQuery, toParams]);

  return { value, setValue };
}

"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { earningsKeys } from "@/lib/query-keys/earnings/earnings-keys";
import { fetchEarnings } from "@/services/api/query/earnings.query";
import type { Earnings } from "@/types/earnings/earnings.type";
import type { EarningsRange } from "@/types/earnings/earnings-range.type";

export function useEarnings(range: EarningsRange): UseQueryResult<Earnings> {
  return useQuery({ queryKey: earningsKeys.range(range), queryFn: () => fetchEarnings(range) });
}

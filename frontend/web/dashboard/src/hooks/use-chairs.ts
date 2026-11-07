"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { chairKeys } from "@/lib/chair-keys";
import { fetchChairPage } from "@/services/api/query/chair-page.query";
import type { ChairFilters } from "@/types/chair-filters.type";
import type { ChairPage } from "@/types/chair-page.type";

export function useChairs(filters: ChairFilters): UseQueryResult<ChairPage> {
  return useQuery({ queryKey: chairKeys.list(filters), queryFn: () => fetchChairPage(filters), placeholderData: keepPreviousData });
}

"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/use-list-query";
import { chairKeys } from "@/lib/chair-keys";
import { fetchChairPage } from "@/services/api/query/chair-page.query";
import type { ChairFilters } from "@/types/chair-filters.type";
import type { ChairPage } from "@/types/chair-page.type";

export function useChairs(filters: ChairFilters): UseQueryResult<ChairPage> {
  return useListQuery(chairKeys.list(filters), () => fetchChairPage(filters));
}

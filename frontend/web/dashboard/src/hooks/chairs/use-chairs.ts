"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/core/query/use-list-query";
import { chairKeys } from "@/lib/query-keys/chairs/chair-keys";
import { fetchChairPage } from "@/services/api/query/chairs/chair-page.query";
import type { ChairFilters } from "@/types/chairs/chair-filters.type";
import type { ChairPage } from "@/types/chairs/chair-page.type";

export function useChairs(filters: ChairFilters): UseQueryResult<ChairPage> {
  return useListQuery(chairKeys.list(filters), () => fetchChairPage(filters));
}

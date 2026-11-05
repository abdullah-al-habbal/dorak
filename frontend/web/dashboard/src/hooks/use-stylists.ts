"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { stylistKeys } from "@/lib/stylist-keys";
import { fetchStylistPage } from "@/services/api/query/stylists.query";
import type { StylistFilters } from "@/types/stylist-filters.type";
import type { StylistPage } from "@/types/stylist-page.type";

export function useStylists(filters: StylistFilters): UseQueryResult<StylistPage> {
  return useQuery({ queryKey: stylistKeys.list(filters), queryFn: () => fetchStylistPage(filters), placeholderData: keepPreviousData });
}

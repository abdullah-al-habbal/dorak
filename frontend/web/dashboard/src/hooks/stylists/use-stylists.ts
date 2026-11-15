"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/core/use-list-query";
import { stylistKeys } from "@/lib/query-keys/stylists/stylist-keys";
import { fetchStylistPage } from "@/services/api/query/stylists/stylists.query";
import type { StylistFilters } from "@/types/stylists/stylist-filters.type";
import type { StylistPage } from "@/types/stylists/stylist-page.type";

export function useStylists(filters: StylistFilters): UseQueryResult<StylistPage> {
  return useListQuery(stylistKeys.list(filters), () => fetchStylistPage(filters));
}

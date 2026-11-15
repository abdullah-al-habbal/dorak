"use client";

import { useUrlFilters } from "@/hooks/core/use-url-filters";
import { clientFiltersFromParams, clientFiltersToParams } from "@/lib/clients/client-filters.util";
import type { ClientFilters } from "@/types/clients/client-filters.type";

/** The URL is the source of truth for the filters, the search and the page. */
export function useClientFilters(): { filters: ClientFilters; update: (patch: Partial<ClientFilters>) => void } {
  return useUrlFilters(clientFiltersFromParams, clientFiltersToParams);
}

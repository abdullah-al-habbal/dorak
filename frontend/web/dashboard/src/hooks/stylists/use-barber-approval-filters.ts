"use client";

import { useUrlFilters } from "@/hooks/core/use-url-filters";
import { barberApprovalFiltersFromParams, barberApprovalFiltersToParams } from "@/lib/stylists/barber-approval-filters.util";
import type { BarberApprovalFilters } from "@/types/stylists/barber-approval-filters.type";

/** The URL is the source of truth for the status filter, the search and the page. */
export function useBarberApprovalFilters(): { filters: BarberApprovalFilters; update: (patch: Partial<BarberApprovalFilters>) => void } {
  return useUrlFilters(barberApprovalFiltersFromParams, barberApprovalFiltersToParams);
}

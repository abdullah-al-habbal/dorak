"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { STALE_TIME } from "@/config/stale-time.constant";
import { useReferenceQuery } from "@/hooks/core/query/use-reference-query";
import { serviceKeys } from "@/lib/query-keys/services/service-keys";
import { fetchServiceCategories } from "@/services/api/query/services/service-categories.query";
import type { ServiceCategory } from "@/types/services/service-category.type";

export function useServiceCategories(): UseQueryResult<ServiceCategory[]> {
  return useReferenceQuery(serviceKeys.categories, fetchServiceCategories, STALE_TIME.Reference);
}

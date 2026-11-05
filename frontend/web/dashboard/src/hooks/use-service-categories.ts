"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { serviceKeys } from "@/lib/service-keys";
import { fetchServiceCategories } from "@/services/api/query/service-categories.query";
import type { ServiceCategory } from "@/types/service-category.type";

const STALE_MS = 5 * 60_000;

export function useServiceCategories(): UseQueryResult<ServiceCategory[]> {
  return useQuery({ queryKey: serviceKeys.categories, queryFn: fetchServiceCategories, staleTime: STALE_MS });
}

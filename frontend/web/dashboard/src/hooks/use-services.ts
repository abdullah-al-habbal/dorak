"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/use-list-query";
import { serviceKeys } from "@/lib/query-keys/services/service-keys";
import { fetchServices } from "@/services/api/query/services.query";
import type { ServiceFilters } from "@/types/service-filters.type";
import type { Service } from "@/types/service.type";

export function useServices(filters: ServiceFilters): UseQueryResult<Service[]> {
  return useListQuery(serviceKeys.list(filters), () => fetchServices(filters));
}

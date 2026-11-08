"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/use-list-query";
import { serviceKeys } from "@/lib/service-keys";
import { fetchServices } from "@/services/api/query/services.query";
import type { Service } from "@/types/service.type";

export function useServices(search: string | undefined): UseQueryResult<Service[]> {
  return useListQuery(serviceKeys.list(search), () => fetchServices(search));
}

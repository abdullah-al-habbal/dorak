"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { serviceKeys } from "@/lib/service-keys";
import { fetchServices } from "@/services/api/query/services.query";
import type { Service } from "@/types/service.type";

export function useServices(search: string | undefined): UseQueryResult<Service[]> {
  return useQuery({ queryKey: serviceKeys.list(search), queryFn: () => fetchServices(search), placeholderData: keepPreviousData });
}

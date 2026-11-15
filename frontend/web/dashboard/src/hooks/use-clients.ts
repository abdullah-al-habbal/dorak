"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/use-list-query";
import { clientKeys } from "@/lib/query-keys/clients/client-keys";
import { fetchClientPage } from "@/services/api/query/client-page.query";
import type { ClientFilters } from "@/types/client-filters.type";
import type { ClientPage } from "@/types/client-page.type";

export function useClients(filters: ClientFilters): UseQueryResult<ClientPage> {
  return useListQuery(clientKeys.list(filters), () => fetchClientPage(filters));
}

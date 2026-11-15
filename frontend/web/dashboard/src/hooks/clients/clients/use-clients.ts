"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/core/query/use-list-query";
import { clientKeys } from "@/lib/query-keys/clients/client-keys";
import { fetchClientPage } from "@/services/api/query/clients/client-page.query";
import type { ClientFilters } from "@/types/clients/clients/client-filters.type";
import type { ClientPage } from "@/types/clients/clients/client-page.type";

export function useClients(filters: ClientFilters): UseQueryResult<ClientPage> {
  return useListQuery(clientKeys.list(filters), () => fetchClientPage(filters));
}

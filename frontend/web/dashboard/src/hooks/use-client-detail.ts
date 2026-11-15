"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { clientKeys } from "@/lib/query-keys/clients/client-keys";
import { fetchClient } from "@/services/api/query/client.query";
import type { AdminClient } from "@/types/clients/admin-client.type";

/** Starts from the list row so the dialog never opens empty; the read adds the ban history. */
export function useClientDetail(client: AdminClient): UseQueryResult<AdminClient> {
  return useQuery({ queryKey: clientKeys.detail(client.id), queryFn: () => fetchClient(client.id), placeholderData: client });
}

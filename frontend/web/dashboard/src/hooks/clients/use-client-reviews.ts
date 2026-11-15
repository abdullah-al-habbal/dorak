"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { ClientRelation } from "@/enums/client-relation.enum";
import { clientKeys } from "@/lib/query-keys/clients/client-keys";
import { fetchClientReviews } from "@/services/api/query/client.query";
import type { ClientReview } from "@/types/clients/client-review.type";

export function useClientReviews(id: string): UseQueryResult<ClientReview[]> {
  return useQuery({ queryKey: clientKeys.relation(id, ClientRelation.Reviews), queryFn: () => fetchClientReviews(id) });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { brandHistoryKeys } from "@/lib/query-keys/brands/brand-history-keys";
import { fetchStatusHistory } from "@/services/api/query/brand-history.query";
import type { StatusChangeLog } from "@/types/core/status-change-log.type";

/** The approval and status history of a brand or branch, read when its detail opens. */
export function useStatusHistory(subjectType: string, id: string): UseQueryResult<StatusChangeLog[]> {
  return useQuery({ queryKey: brandHistoryKeys.subject(subjectType, id), queryFn: () => fetchStatusHistory(subjectType, id) });
}

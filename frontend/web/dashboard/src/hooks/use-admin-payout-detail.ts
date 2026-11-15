"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useDetailQuery } from "@/hooks/use-detail-query";
import { useListQuery } from "@/hooks/use-list-query";
import { adminPayoutKeys } from "@/lib/query-keys/earnings/admin-payout-keys";
import { fetchAdminPayout, fetchPayoutEntries } from "@/services/api/query/admin-payout-detail.query";
import type { AdminPayout } from "@/types/admin-payout.type";
import type { CommissionEntryPage } from "@/types/commission.type";

export function useAdminPayoutDetail(id: string): UseQueryResult<AdminPayout> {
  return useDetailQuery(id, adminPayoutKeys.detail, fetchAdminPayout);
}

export function usePayoutEntries(id: string, page: number): UseQueryResult<CommissionEntryPage> {
  return useListQuery(adminPayoutKeys.entries(id, page), () => fetchPayoutEntries(id, page));
}

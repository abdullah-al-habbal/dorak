"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useDetailQuery } from "@/hooks/core/use-detail-query";
import { useListQuery } from "@/hooks/core/use-list-query";
import { adminPayoutKeys } from "@/lib/query-keys/earnings/admin-payout-keys";
import { fetchAdminPayout, fetchPayoutEntries } from "@/services/api/query/earnings/admin-payout-detail.query";
import type { AdminPayout } from "@/types/earnings/admin-payout.type";
import type { CommissionEntryPage } from "@/types/earnings/commission.type";

export function useAdminPayoutDetail(id: string): UseQueryResult<AdminPayout> {
  return useDetailQuery(id, adminPayoutKeys.detail, fetchAdminPayout);
}

export function usePayoutEntries(id: string, page: number): UseQueryResult<CommissionEntryPage> {
  return useListQuery(adminPayoutKeys.entries(id, page), () => fetchPayoutEntries(id, page));
}

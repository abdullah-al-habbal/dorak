"use client";

import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";

import { useDeleteMutation } from "@/hooks/core/query/use-delete-mutation";
import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { useListQuery } from "@/hooks/core/query/use-list-query";
import { useSaveMutation } from "@/hooks/core/query/use-save-mutation";
import type { SaveVariables } from "@/interfaces/core/query/save-variables.interface";
import { commissionKeys } from "@/lib/query-keys/earnings/commission-keys";
import { createCommissionRule, deleteCommissionRule, updateCommissionRule } from "@/services/api/mutation/earnings/commission.mutation";
import type { CommissionRulePayload } from "@/services/api/mutation/earnings/commission.mutation";
import { fetchCommissionEntries, fetchCommissionRules } from "@/services/api/query/earnings/commission.query";
import type { CommissionEntryPage, CommissionRule, CommissionRulePage } from "@/types/earnings/commission.type";

export function useCommissionRules(page: number): UseQueryResult<CommissionRulePage> {
  return useListQuery(commissionKeys.rules(page), () => fetchCommissionRules(page));
}

export function useCommissionEntries(brandId: string, settled: string, page: number): UseQueryResult<CommissionEntryPage> {
  return useListQuery(commissionKeys.entries(brandId, settled, page), () => fetchCommissionEntries(brandId, settled, page));
}

export function useSaveCommissionRule(): UseMutationResult<CommissionRule, Error, SaveVariables<CommissionRulePayload>> {
  const { commissions } = useDictionary();
  return useSaveMutation({ create: createCommissionRule, update: updateCommissionRule, invalidate: [commissionKeys.all], messages: commissions.toast });
}

export function useDeleteCommissionRule(): UseMutationResult<void, Error, string> {
  const { commissions } = useDictionary();
  return useDeleteMutation({ remove: deleteCommissionRule, invalidate: [commissionKeys.all], messages: commissions.toast });
}

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

import { useDictionary } from "@/hooks/use-dictionary";
import { adminPayoutKeys } from "@/lib/admin-payout-keys";
import { generatePayouts } from "@/services/api/mutation/generate-payouts.mutation";
import type { AdminPayout } from "@/types/admin-payout.type";

export function useGeneratePayouts(): UseMutationResult<AdminPayout[], Error, void> {
  const { adminPayouts } = useDictionary();
  const client = useQueryClient();
  return useMutation({
    mutationFn: generatePayouts,
    onSuccess: (created) => toast.success(created.length === 0 ? adminPayouts.toast.nothingToGenerate : adminPayouts.toast.generated.replace("{count}", String(created.length))),
    onError: () => toast.error(adminPayouts.toast.generateFailed),
    onSettled: () => client.invalidateQueries({ queryKey: adminPayoutKeys.all }),
  });
}

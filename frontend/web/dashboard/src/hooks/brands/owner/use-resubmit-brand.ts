"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { useFeedbackMutation } from "@/hooks/core/query/use-feedback-mutation";
import { ownerBrandKeys } from "@/lib/query-keys/brands/owner-brand-keys";
import { resubmitBrand } from "@/services/api/mutation/brands/brand-lifecycle.mutation";
import type { AdminBrand } from "@/types/brands/admin-brand.type";

export function useResubmitBrand(): UseMutationResult<AdminBrand, Error, string> {
  const { registerBusiness } = useDictionary();
  return useFeedbackMutation({
    mutationFn: resubmitBrand,
    invalidate: [ownerBrandKeys.all],
    successMessage: () => registerBusiness.status.resubmitted,
    errorMessage: () => registerBusiness.status.resubmitFailed,
  });
}

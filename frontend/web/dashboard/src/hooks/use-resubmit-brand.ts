"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useFeedbackMutation } from "@/hooks/use-feedback-mutation";
import { ownerBrandKeys } from "@/lib/owner-brand-keys";
import { resubmitBrand } from "@/services/api/mutation/brand-lifecycle.mutation";
import type { AdminBrand } from "@/types/admin-brand.type";

export function useResubmitBrand(): UseMutationResult<AdminBrand, Error, string> {
  const { registerBusiness } = useDictionary();
  return useFeedbackMutation({
    mutationFn: resubmitBrand,
    invalidate: [ownerBrandKeys.all],
    successMessage: () => registerBusiness.status.resubmitted,
    errorMessage: () => registerBusiness.status.resubmitFailed,
  });
}

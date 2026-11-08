"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useFeedbackMutation } from "@/hooks/use-feedback-mutation";
import { adminBrandKeys } from "@/lib/admin-brand-keys";
import { branchKeys } from "@/lib/branch-keys";
import { approveBrand } from "@/services/api/mutation/approve-brand.mutation";
import type { AdminBrand } from "@/types/admin-brand.type";

export function useApproveBrand(): UseMutationResult<AdminBrand, Error, string> {
  const { adminBrands } = useDictionary();
  return useFeedbackMutation({
    mutationFn: approveBrand,
    // The brand pickers (branch form, assign-plan dialog) read the same brands.
    invalidate: [adminBrandKeys.all, branchKeys.brands],
    successMessage: () => adminBrands.toast.approved,
    errorMessage: () => adminBrands.toast.approveFailed,
  });
}

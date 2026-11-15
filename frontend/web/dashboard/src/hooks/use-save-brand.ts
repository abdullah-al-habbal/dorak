"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useFeedbackMutation } from "@/hooks/use-feedback-mutation";
import type { BrandUpdatePayload } from "@/interfaces/brand-update-payload.interface";
import { adminBrandKeys } from "@/lib/query-keys/brands/admin-brand-keys";
import { branchKeys } from "@/lib/query-keys/branches/branch-keys";
import { ownerBrandKeys } from "@/lib/query-keys/brands/owner-brand-keys";
import { updateBrand } from "@/services/api/mutation/brand-lifecycle.mutation";
import type { AdminBrand } from "@/types/admin-brand.type";

interface SaveBrandVariables {
  id: string;
  payload: BrandUpdatePayload;
}

/** Edits a brand's name and description. Failures are rethrown to the form. */
export function useSaveBrand(): UseMutationResult<AdminBrand, Error, SaveBrandVariables> {
  const { adminBrands } = useDictionary();
  return useFeedbackMutation({
    mutationFn: ({ id, payload }) => updateBrand(id, payload),
    invalidate: [adminBrandKeys.all, ownerBrandKeys.all, branchKeys.brands],
    successMessage: () => adminBrands.toast.saved,
  });
}

"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useFeedbackMutation } from "@/hooks/use-feedback-mutation";
import type { BrandCreatePayload } from "@/interfaces/brands/brand-create-payload.interface";
import { branchKeys } from "@/lib/query-keys/branches/branch-keys";
import { ownerBrandKeys } from "@/lib/query-keys/brands/owner-brand-keys";
import { createBrand } from "@/services/api/mutation/brand-create.mutation";
import type { AdminBrand } from "@/types/brands/admin-brand.type";

/** Failures are rethrown to the form. */
export function useCreateBrand(): UseMutationResult<AdminBrand, Error, BrandCreatePayload> {
  const { ownerBrand } = useDictionary();
  return useFeedbackMutation({
    mutationFn: createBrand,
    invalidate: [ownerBrandKeys.all, branchKeys.brands],
    successMessage: () => ownerBrand.toast.created,
  });
}

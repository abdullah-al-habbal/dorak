"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { BrandLifecycleAction } from "@/enums/brand-lifecycle-action.enum";
import { useDictionary } from "@/hooks/use-dictionary";
import { useFeedbackMutation } from "@/hooks/use-feedback-mutation";
import type { BrandLifecyclePayload } from "@/interfaces/brands/brand-lifecycle-payload.interface";
import { adminBrandKeys } from "@/lib/query-keys/brands/admin-brand-keys";
import { brandHistoryKeys } from "@/lib/query-keys/brands/brand-history-keys";
import { branchKeys } from "@/lib/query-keys/branches/branch-keys";
import { transitionBrand } from "@/services/api/mutation/brand-lifecycle.mutation";
import type { AdminBrand } from "@/types/brands/admin-brand.type";

/** Reject, suspend and reactivate. Failures are rethrown to the dialog, which shows them inline. */
export function useBrandLifecycle(): UseMutationResult<AdminBrand, Error, BrandLifecyclePayload> {
  const { adminBrands } = useDictionary();
  return useFeedbackMutation({
    mutationFn: transitionBrand,
    // The brand pickers read the same brands; the history gains a row.
    invalidate: [adminBrandKeys.all, branchKeys.brands, brandHistoryKeys.all],
    successMessage: (_brand, { action }) => adminBrands.toast[action === BrandLifecycleAction.Reject ? "rejected" : action === BrandLifecycleAction.Suspend ? "suspended" : "reactivated"],
  });
}

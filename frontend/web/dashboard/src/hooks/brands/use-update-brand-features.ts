"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/use-dictionary";
import { useFeedbackMutation } from "@/hooks/core/use-feedback-mutation";
import { adminBrandKeys } from "@/lib/query-keys/brands/admin-brand-keys";
import { updateBrandFeatures } from "@/services/api/mutation/brands/brand-lifecycle.mutation";

interface FeatureVariables {
  id: string;
  flags: Record<string, boolean>;
}

export function useUpdateBrandFeatures(): UseMutationResult<Record<string, boolean>, Error, FeatureVariables> {
  const { adminBrands } = useDictionary();
  return useFeedbackMutation({
    mutationFn: ({ id, flags }) => updateBrandFeatures(id, flags),
    invalidate: [adminBrandKeys.all],
    successMessage: () => adminBrands.toast.featuresSaved,
    errorMessage: () => adminBrands.toast.featuresFailed,
  });
}

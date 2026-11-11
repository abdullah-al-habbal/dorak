"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useFeedbackMutation } from "@/hooks/use-feedback-mutation";
import { stylistPricingKeys } from "@/lib/stylist-pricing-keys";
import { clearServiceOverride, saveServiceOverride } from "@/services/api/mutation/stylist-pricing.mutation";
import type { ServiceOverridePayload } from "@/services/api/mutation/stylist-pricing.mutation";
import type { ServiceTerms } from "@/types/service-terms.type";

interface SaveVariables {
  barberId: string;
  serviceId: string;
  payload: ServiceOverridePayload;
}

interface ClearVariables {
  barberId: string;
  serviceId: string;
  brandId: string;
}

export function useSaveServiceOverride(): UseMutationResult<ServiceTerms, Error, SaveVariables> {
  const { stylistPricing } = useDictionary();
  return useFeedbackMutation({
    mutationFn: ({ barberId, serviceId, payload }: SaveVariables) => saveServiceOverride(barberId, serviceId, payload),
    invalidate: [stylistPricingKeys.all],
    successMessage: () => stylistPricing.toast.saved,
    errorMessage: () => stylistPricing.toast.failed,
  });
}

export function useClearServiceOverride(): UseMutationResult<void, Error, ClearVariables> {
  const { stylistPricing } = useDictionary();
  return useFeedbackMutation({
    mutationFn: ({ barberId, serviceId, brandId }: ClearVariables) => clearServiceOverride(barberId, serviceId, brandId),
    invalidate: [stylistPricingKeys.all],
    successMessage: () => stylistPricing.toast.cleared,
    errorMessage: () => stylistPricing.toast.failed,
  });
}

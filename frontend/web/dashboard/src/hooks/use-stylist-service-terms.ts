"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/use-list-query";
import { stylistPricingKeys } from "@/lib/query-keys/stylists/stylist-pricing-keys";
import { fetchStylistServiceTerms } from "@/services/api/query/stylist-pricing.query";
import type { ServiceTerms } from "@/types/service-terms.type";

export function useStylistServiceTerms(barberId: string, brandId: string | null): UseQueryResult<ServiceTerms[]> {
  return useListQuery(stylistPricingKeys.terms(barberId, brandId ?? ""), () => fetchStylistServiceTerms(barberId, brandId ?? ""), brandId !== null);
}

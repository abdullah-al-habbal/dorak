"use client";

import { BARBER_SERVICE_TERMS_QUERY_KEY } from "@/services/api/dashboard/barber-service-override/barber-service-override.constant";
import { getBarberServiceTerms } from "@/services/api/dashboard/barber-service-override/barber-service-override.query";
import { useQuery } from "@tanstack/react-query";

export function useBarberServiceTermsQuery(
  barberId: string,
  brandId: string | undefined,
) {
  return useQuery({
    enabled: brandId !== undefined && brandId !== "",
    queryKey: [...BARBER_SERVICE_TERMS_QUERY_KEY, barberId, brandId],
    queryFn: () => getBarberServiceTerms(barberId, brandId ?? ""),
  });
}

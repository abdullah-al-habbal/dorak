import { api } from "@/services/api/core/client";
import { mapBarberServiceTermsList } from "@/services/api/dashboard/barber-service-override/barber-service-override.mapper.util";
import { DashboardEndpoints } from "@/services/api/dashboard/endpoints/dashboard.endpoints";
import type { IBarberServiceTerms } from "@/services/api/dashboard/barber-service-override/types/ibarber-service-terms.types";

export async function getBarberServiceTerms(
  barberId: string,
  brandId: string,
): Promise<IBarberServiceTerms[]> {
  return mapBarberServiceTermsList(
    await api.get<unknown>(
      DashboardEndpoints.barberServices(barberId, brandId),
    ),
  );
}

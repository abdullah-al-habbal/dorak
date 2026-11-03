import { api } from "@/services/api/core/client";
import { barberServiceOverrideBody } from "@/services/api/dashboard/barber-service-override/barber-service-override.util";
import { mapBarberServiceTerms } from "@/services/api/dashboard/barber-service-override/barber-service-override.mapper.util";
import { DashboardEndpoints } from "@/services/api/dashboard/endpoints/dashboard.endpoints";
import type { IBarberServiceOverrideForm } from "@/services/api/dashboard/barber-service-override/types/ibarber-service-override-form.types";

export async function saveBarberServiceOverride(
  barberId: string,
  serviceId: string,
  brandId: string,
  form: IBarberServiceOverrideForm,
) {
  return mapBarberServiceTerms(
    await api.put<unknown>(
      DashboardEndpoints.barberServiceOverride(barberId, serviceId),
      barberServiceOverrideBody(brandId, form),
    ),
  );
}

export async function clearBarberServiceOverride(
  barberId: string,
  serviceId: string,
  brandId: string,
) {
  await api.delete<unknown>(
    DashboardEndpoints.barberServiceOverride(barberId, serviceId, brandId),
  );
}

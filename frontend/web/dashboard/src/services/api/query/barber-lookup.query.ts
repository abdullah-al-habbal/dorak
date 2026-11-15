import { DASHBOARD_API } from "@/config/routes.constant";
import { barberLookupListSchema } from "@/schemas/stylists/barber-lookup.zod";
import { apiRequest } from "@/services/api/core/client";
import type { BarberLookup } from "@/types/stylists/barber-lookup.type";

export function fetchBarberLookup(search: string): Promise<BarberLookup[]> {
  return apiRequest(`${DASHBOARD_API}/barber-lookup?search=${encodeURIComponent(search)}`, { schema: barberLookupListSchema });
}

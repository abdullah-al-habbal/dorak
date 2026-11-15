import { DASHBOARD_API } from "@/config/routes.constant";
import { barberActivationLogListSchema, barberAffiliationListSchema } from "@/schemas/stylists/barber-approval.zod";
import { apiRequest } from "@/services/api/core/client";
import type { BarberActivationLog } from "@/types/stylists/barber-activation-log.type";
import type { BarberAffiliation } from "@/types/stylists/barber-affiliation.type";

function barberPath(id: string): string {
  return `${DASHBOARD_API}/admin/barbers/${encodeURIComponent(id)}`;
}

export function fetchBarberActivationLog(id: string): Promise<BarberActivationLog[]> {
  return apiRequest(`${barberPath(id)}/activation-log`, { schema: barberActivationLogListSchema });
}

export function fetchBarberAffiliations(id: string): Promise<BarberAffiliation[]> {
  return apiRequest(`${barberPath(id)}/affiliations`, { schema: barberAffiliationListSchema });
}

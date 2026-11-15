import { DASHBOARD_API } from "@/config/routes.constant";
import { barberApprovalSchema } from "@/schemas/stylists/barber-approval.zod";
import { apiRequest } from "@/services/api/core/client";
import type { BarberApproval } from "@/types/stylists/barber-approval.type";

export function fetchBarberApproval(id: string): Promise<BarberApproval> {
  return apiRequest(`${DASHBOARD_API}/admin/barbers/${encodeURIComponent(id)}`, { schema: barberApprovalSchema });
}

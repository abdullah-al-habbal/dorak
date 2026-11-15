import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/access/http-method.enum";
import { barberApprovalSchema } from "@/schemas/stylists/barber-approval.zod";
import { apiRequest } from "@/services/api/core/client";
import type { BarberApproval } from "@/types/stylists/barber-approval.type";

export function approveBarber(id: string): Promise<BarberApproval> {
  return apiRequest(`${DASHBOARD_API}/admin/barbers/${encodeURIComponent(id)}/approve`, { method: HttpMethod.Patch, schema: barberApprovalSchema });
}

export function rejectBarber({ id, reason }: { id: string; reason: string }): Promise<BarberApproval> {
  return apiRequest(`${DASHBOARD_API}/admin/barbers/${encodeURIComponent(id)}/reject`, { method: HttpMethod.Patch, body: { reason }, schema: barberApprovalSchema });
}

import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/access/http-method.enum";
import { barberApprovalSchema } from "@/schemas/stylists/barber-approval.zod";
import { apiRequest } from "@/services/api/core/client";
import type { BarberApproval } from "@/types/stylists/barber-approval.type";

interface BanBarberPayload {
  id: string;
  reason: string;
  expiresAt?: string;
}

function barberPath(id: string): string {
  return `${DASHBOARD_API}/admin/barbers/${encodeURIComponent(id)}`;
}

/** Switches an approved barber on or off; the backend logs who did it. */
export function setBarberActive({ id, active }: { id: string; active: boolean }): Promise<BarberApproval> {
  return apiRequest(`${barberPath(id)}/${active ? "activate" : "deactivate"}`, { method: HttpMethod.Patch, schema: barberApprovalSchema });
}

export function banBarber({ id, reason, expiresAt }: BanBarberPayload): Promise<BarberApproval> {
  return apiRequest(`${barberPath(id)}/ban`, { method: HttpMethod.Post, body: { reason, expires_at: expiresAt ?? null }, schema: barberApprovalSchema });
}

export function unbanBarber(id: string): Promise<BarberApproval> {
  return apiRequest(`${barberPath(id)}/unban`, { method: HttpMethod.Patch, schema: barberApprovalSchema });
}

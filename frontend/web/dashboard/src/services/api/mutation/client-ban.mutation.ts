import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import { adminClientSchema } from "@/schemas/admin-client.zod";
import { apiRequest } from "@/services/api/core/client";
import type { AdminClient } from "@/types/clients/admin-client.type";

interface BanClientPayload {
  id: string;
  reason: string;
  /** ISO date-time; undefined bans permanently. */
  expiresAt?: string;
}

function clientPath(id: string): string {
  return `${DASHBOARD_API}/admin/clients/${encodeURIComponent(id)}`;
}

export function banClient({ id, reason, expiresAt }: BanClientPayload): Promise<AdminClient> {
  return apiRequest(`${clientPath(id)}/ban`, { method: HttpMethod.Post, body: { reason, expires_at: expiresAt ?? null }, schema: adminClientSchema });
}

export function unbanClient(id: string): Promise<AdminClient> {
  return apiRequest(`${clientPath(id)}/unban`, { method: HttpMethod.Patch, schema: adminClientSchema });
}

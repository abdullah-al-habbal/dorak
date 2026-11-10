import { z } from "zod";

import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import type { AdminUserPayload } from "@/interfaces/admin-user-payload.interface";
import { adminUserSchema } from "@/schemas/admin-user.zod";
import { apiRequest } from "@/services/api/core/client";
import type { AdminUser } from "@/types/admin-user.type";

const ADMINS = `${DASHBOARD_API}/admin/admins`;

function adminPath(id: string): string {
  return `${ADMINS}/${encodeURIComponent(id)}`;
}

/** Inviting mails the colleague a link to set their own password. */
export function inviteAdminUser(payload: AdminUserPayload): Promise<AdminUser> {
  return apiRequest(ADMINS, { method: HttpMethod.Post, body: payload, schema: adminUserSchema });
}

export function updateAdminUser(id: string, payload: AdminUserPayload): Promise<AdminUser> {
  return apiRequest(adminPath(id), { method: HttpMethod.Put, body: payload, schema: adminUserSchema });
}

export function deactivateAdminUser(id: string): Promise<AdminUser> {
  return apiRequest(`${adminPath(id)}/deactivate`, { method: HttpMethod.Patch, schema: adminUserSchema });
}

export function reactivateAdminUser(id: string): Promise<AdminUser> {
  return apiRequest(`${adminPath(id)}/reactivate`, { method: HttpMethod.Patch, schema: adminUserSchema });
}

export async function resendAdminInvite(id: string): Promise<void> {
  await apiRequest(`${adminPath(id)}/resend-invite`, { method: HttpMethod.Post, schema: z.unknown() });
}

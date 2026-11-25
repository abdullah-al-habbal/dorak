import { WEB_PUSH_API } from "@/config/push/web-push.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/access/http-method.enum";
import type { Locale } from "@/enums/access/locale.enum";
import { pushTokenResultSchema, pushTokenRevokedSchema } from "@/schemas/push/push-token-result.zod";
import { apiRequest } from "@/services/api/core/client";

interface RegisterPushTokenInput {
  token: string;
  locale: Locale;
}

/** Turns browser push on for the signed-in account; the backend ties the token to that account only. */
export async function registerPushToken({ token, locale }: RegisterPushTokenInput): Promise<void> {
  await apiRequest(`${DASHBOARD_API}${WEB_PUSH_API.token}`, { method: HttpMethod.Post, body: { token, locale }, schema: pushTokenResultSchema });
}

export async function revokePushToken(token: string): Promise<void> {
  await apiRequest(`${DASHBOARD_API}${WEB_PUSH_API.token}`, { method: HttpMethod.Delete, body: { token }, schema: pushTokenRevokedSchema });
}

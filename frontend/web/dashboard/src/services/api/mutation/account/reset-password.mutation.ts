import { API_ROUTE } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/access/http-method.enum";
import { acknowledgementSchema } from "@/schemas/core/api/acknowledgement.zod";
import { apiRequest } from "@/services/api/core/client";
import type { ResetPasswordBody } from "@/types/account/forms/reset-password-body.type";

export async function resetPassword(body: ResetPasswordBody): Promise<void> {
  await apiRequest(API_ROUTE.passwordReset, { method: HttpMethod.Post, body, schema: acknowledgementSchema, skipRefresh: true });
}

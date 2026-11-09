import { API_ROUTE } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import { acknowledgementSchema } from "@/schemas/acknowledgement.zod";
import { apiRequest } from "@/services/api/core/client";
import type { ForgotPasswordBody } from "@/types/forgot-password-body.type";

export async function requestPasswordReset(body: ForgotPasswordBody): Promise<void> {
  await apiRequest(API_ROUTE.passwordForgot, { method: HttpMethod.Post, body, schema: acknowledgementSchema, skipRefresh: true });
}

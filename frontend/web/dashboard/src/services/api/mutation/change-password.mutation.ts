import { API_ROUTE } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import { acknowledgementSchema } from "@/schemas/acknowledgement.zod";
import { apiRequest } from "@/services/api/core/client";
import type { ChangePasswordBody } from "@/types/change-password-body.type";

export async function changePassword(body: ChangePasswordBody): Promise<void> {
  await apiRequest(API_ROUTE.passwordChange, { method: HttpMethod.Put, body, schema: acknowledgementSchema });
}

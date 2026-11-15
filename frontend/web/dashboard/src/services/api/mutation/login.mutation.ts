import { API_ROUTE } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import { loginResultSchema } from "@/schemas/login-result.zod";
import { apiRequest } from "@/services/api/core/client";
import type { LoginBody } from "@/types/core/login-body.type";
import type { LoginResult } from "@/types/core/login-result.type";

export function loginMutation(body: LoginBody): Promise<LoginResult> {
  return apiRequest(API_ROUTE.login, { method: HttpMethod.Post, body, schema: loginResultSchema, skipRefresh: true });
}

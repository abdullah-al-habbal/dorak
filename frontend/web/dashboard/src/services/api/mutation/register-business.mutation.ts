import { API_ROUTE } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import { acknowledgementSchema } from "@/schemas/core/acknowledgement.zod";
import { loginResultSchema } from "@/schemas/core/login-result.zod";
import { apiRequest } from "@/services/api/core/client";
import type { LoginResult } from "@/types/core/login-result.type";
import type { RegisterBusinessBody } from "@/types/core/register-business-body.type";
import type { RegisterExistingBody } from "@/types/core/register-existing-body.type";

/** Public sign-up. The answer is the same for any email, so a success only means "check your email". */
export async function registerBusiness(body: RegisterBusinessBody): Promise<void> {
  await apiRequest(API_ROUTE.registerBusiness, { method: HttpMethod.Post, body, schema: acknowledgementSchema, skipRefresh: true });
}

export async function resendOwnerCode(email: string): Promise<void> {
  await apiRequest(API_ROUTE.registerResend, { method: HttpMethod.Post, body: { email }, schema: acknowledgementSchema, skipRefresh: true });
}

/** A correct code confirms the email and opens the owner session (the route sets the cookies). */
export function verifyOwnerCode(body: { email: string; code: string }): Promise<LoginResult> {
  return apiRequest(API_ROUTE.registerVerify, { method: HttpMethod.Post, body, schema: loginResultSchema, skipRefresh: true });
}

export function createBrandForExistingClient(body: RegisterExistingBody): Promise<LoginResult> {
  return apiRequest(API_ROUTE.registerExisting, { method: HttpMethod.Post, body, schema: loginResultSchema, skipRefresh: true });
}

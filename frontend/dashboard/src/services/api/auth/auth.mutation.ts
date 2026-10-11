import { ROUTES } from "@/config/routes.constant";
import type {
  LoginCredentials,
  LoginResponse,
  LogoutResponse,
} from "@/services/api/auth/auth.types";
import { apiRequest } from "@/services/api/client";

export function requestLogin(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>(ROUTES.api.auth.login, {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function requestLogout(): Promise<LogoutResponse> {
  return apiRequest<LogoutResponse>(ROUTES.api.auth.logout, {
    method: "POST",
    auth: "session",
  });
}

import { AuthEndpoints } from "@/services/api/auth/endpoints/auth.endpoints";
import { api } from "@/services/api/core/client";
import type {
  LoginCredentials,
  LoginResponse,
  LogoutResponse,
} from "@/services/api/auth/types/auth.types";

export function requestLogin(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  return api.post<LoginResponse>(AuthEndpoints.login, credentials, {
    auth: "public",
  });
}

export function requestLogout(): Promise<LogoutResponse> {
  return api.post<LogoutResponse>(AuthEndpoints.logout);
}

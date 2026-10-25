import { AuthEndpoints } from "@/services/api/auth/endpoints/auth.endpoints";
import { api } from "@/services/api/client";
import type {
  LoginCredentials,
  LoginResponse,
  LogoutResponse,
} from "@/services/api/auth/auth.types";

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

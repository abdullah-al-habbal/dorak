import { BACKEND_PATH } from "@/config/backend.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import type { SessionTokens } from "@/interfaces/session-tokens.interface";
import { backendRequest } from "@/services/api/auth/backend-client";
import { tokensFromBackendData } from "@/services/api/auth/login-data.util";

export async function refreshSession(
  refreshToken: string,
  claim: string | undefined,
): Promise<SessionTokens | null> {
  const result = await backendRequest({
    path: BACKEND_PATH.refresh,
    method: HttpMethod.Post,
    body: { refresh_token: refreshToken, ...(claim ? { claim } : {}) },
  });
  return result.ok ? tokensFromBackendData(result.envelope?.data) : null;
}

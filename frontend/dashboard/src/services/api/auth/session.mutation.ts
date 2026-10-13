import { ROUTES } from "@/config/routes.constant";
import type {
  BackendLoginData,
  RefreshedSession,
} from "@/services/api/auth/auth.types";
import { backendRequest } from "@/services/api/auth/backend-client";
import { sessionFromBackendLoginData } from "@/services/api/auth/session.util";

/**
 * Rotate an opaque refresh token against the backend and build the cookie
 * payload for the new session. Returns null when the backend rejects it or is
 * unreachable (fail closed).
 */
export async function refreshDashboardSession(
  refreshToken: string,
  previousClaim?: string,
): Promise<RefreshedSession | null> {
  const { ok, envelope } = await backendRequest<BackendLoginData>(
    ROUTES.api.dashboard.refresh,
    {
      method: "POST",
      body: JSON.stringify({
        refresh_token: refreshToken,
        claim: previousClaim,
      }),
    },
  );

  if (!ok || !envelope?.data) {
    return null;
  }

  return sessionFromBackendLoginData(envelope.data);
}

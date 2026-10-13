import type {
  BackendLoginData,
  DashboardClaim,
  RefreshedSession,
} from "@/services/api/auth/auth.types";
import { verifyDashboardClaim } from "@/services/api/auth/jwt.util";
import { getSessionSecrets } from "@/services/api/auth/session-secret.util";

/** Verify a claim cookie against the shared session secret; absent tokens fail closed. */
export async function verifySessionClaim(
  token: string | undefined,
): Promise<DashboardClaim | null> {
  return token ? verifyDashboardClaim(token, getSessionSecrets()) : null;
}

function isPositiveWholeSeconds(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0;
}

/**
 * Accept backend credentials only when their signed claim can be verified with
 * the shared server secret. This keeps untrusted response data out of cookies.
 */
export async function sessionFromBackendLoginData(
  data: BackendLoginData,
): Promise<RefreshedSession | null> {
  if (
    typeof data.claim !== "string" ||
    typeof data.token !== "string" ||
    data.token.length === 0 ||
    typeof data.refresh_token !== "string" ||
    data.refresh_token.length === 0 ||
    !isPositiveWholeSeconds(data.expires_in) ||
    !isPositiveWholeSeconds(data.refresh_expires_in)
  ) {
    return null;
  }

  const claim = await verifySessionClaim(data.claim);
  if (claim === null) {
    return null;
  }

  return {
    claim,
    cookies: {
      claim: data.claim,
      accessToken: data.token,
      refreshToken: data.refresh_token,
      claimMaxAgeSeconds: data.expires_in,
      refreshMaxAgeSeconds: data.refresh_expires_in,
    },
  };
}

import { ROUTES } from "@/config/routes.constant";
import { backendRequest } from "@/services/api/auth/backend-client";
import { apiFailure, apiSuccess, noStore } from "@/services/api/response.util";

export const dynamic = "force-dynamic";

/** Public BFF health endpoint. Upstream request never carries user credentials. */
export async function GET() {
  const result = await backendRequest(ROUTES.api.dashboard.health);

  if (result.status === 0 || result.status >= 500) {
    return noStore(
      apiFailure(503, "backend_unavailable", "Backend service is unavailable."),
    );
  }

  if (result.status >= 300 && result.status < 500) {
    return noStore(
      apiSuccess({ backend: "degraded" as const, status: result.status }),
    );
  }

  return noStore(apiSuccess({ backend: "available" as const }));
}

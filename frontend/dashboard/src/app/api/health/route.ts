import { ROUTES } from "@/config/routes.constant";
import { backendRequest } from "@/services/api/auth/backend-client";
import { API_ERROR_CODE } from "@/services/api/core/error-code.constant";
import {
  apiFailure,
  apiSuccess,
  noStore,
} from "@/services/api/core/response.util";
import { getRequestDictionary } from "@/i18n/request-dictionary.util";

export const dynamic = "force-dynamic";

/** Public BFF health endpoint. Upstream request never carries user credentials. */
export async function GET(request: Request = new Request("http://localhost")) {
  const copy = getRequestDictionary(request).common.apiError;
  const result = await backendRequest(ROUTES.api.dashboard.health);

  if (result.status === 0 || result.status >= 500) {
    return noStore(
      apiFailure(503, API_ERROR_CODE.BACKEND_UNAVAILABLE, copy.server),
    );
  }

  if (result.status >= 300 && result.status < 500) {
    return noStore(
      apiSuccess({ backend: "degraded" as const, status: result.status }),
    );
  }

  return noStore(apiSuccess({ backend: "available" as const }));
}

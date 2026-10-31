import { backendRequest } from "@/services/api/auth/backend-client";
import { readSessionCookies } from "@/services/api/auth/cookies";
import { verifySessionClaim } from "@/services/api/auth/session.util";
import { bearerHeaders } from "@/services/api/core/http.util";
import { API_ERROR_CODE } from "@/services/api/core/error-code.constant";
import {
  apiFailure,
  apiSuccess,
  noStore,
} from "@/services/api/core/response.util";
import { getRequestDictionary } from "@/i18n/request-dictionary.util";
import type {
  LookupOption,
  LookupResource,
} from "@/services/api/common/lookup/types/lookup.types";
import type { NextRequest } from "next/server";
import { LOOKUP_PROXY_PATHS } from "@/app/api/lookups/[resource]/route.constant";

function isLookupResource(value: string): value is LookupResource {
  return value in LOOKUP_PROXY_PATHS;
}

function lookupLabel(
  resource: LookupResource,
  item: Record<string, unknown>,
): string {
  if (resource === "currencies")
    return String(item.code ?? item.name ?? item.id);
  const name = item.name;
  if (typeof name === "string") return name;
  if (name && typeof name === "object")
    return String(
      (name as Record<string, unknown>).en ??
        (name as Record<string, unknown>).ar ??
        item.id,
    );
  return String(item.title ?? item.id);
}

function brandBranchLimitReached(item: Record<string, unknown>): boolean {
  const features = item.features as Record<string, unknown> | undefined;
  const branchesCount =
    typeof item.branches_count === "number" ? item.branches_count : 0;
  return branchesCount >= 1 && features?.multi_branch !== true;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ resource: string }> },
) {
  const copy = getRequestDictionary(request).common.apiError;
  const { resource } = await context.params;
  const { accessToken, claim } = readSessionCookies(request.cookies);
  const session = await verifySessionClaim(claim);
  if (!accessToken || !session)
    return noStore(
      apiFailure(401, API_ERROR_CODE.SESSION_EXPIRED, copy.unauthorized),
    );
  if (session.actor_type === "barber")
    return noStore(apiFailure(403, API_ERROR_CODE.FORBIDDEN, copy.forbidden));
  if (!isLookupResource(resource))
    return noStore(
      apiFailure(404, API_ERROR_CODE.RESOURCE_NOT_FOUND, copy.notFound),
    );

  const result = await backendRequest<unknown>(LOOKUP_PROXY_PATHS[resource], {
    headers: bearerHeaders(accessToken),
  });
  if (!result.ok || !Array.isArray(result.envelope?.data))
    return noStore(
      apiFailure(
        result.status || 502,
        result.envelope?.code ?? API_ERROR_CODE.LOOKUP_REQUEST_FAILED,
        copy.server,
      ),
    );

  // A brand owner may only pick brands they own; the backend rejects others.
  const ownedBrandIds =
    resource === "brands" && session.actor_type === "owner"
      ? new Set(session.brand_ids ?? [])
      : null;
  const data: LookupOption[] = result.envelope.data
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string",
    )
    .filter(
      (item) => ownedBrandIds === null || ownedBrandIds.has(item.id as string),
    )
    .map((item) => ({
      id: item.id as string,
      label: lookupLabel(resource, item),
      ...(resource === "brands"
        ? { branchLimitReached: brandBranchLimitReached(item) }
        : {}),
    }));
  return noStore(apiSuccess(data));
}

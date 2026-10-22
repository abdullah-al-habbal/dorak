import { backendRequest } from "@/services/api/auth/backend-client";
import { readSessionCookies } from "@/services/api/auth/cookies";
import { verifySessionClaim } from "@/services/api/auth/session.util";
import { bearerHeaders } from "@/services/api/http.util";
import { apiFailure, apiSuccess, noStore } from "@/services/api/response.util";
import { getRequestDictionary } from "@/i18n/request-dictionary.util";
import type { LookupOption, LookupResource } from "@/services/api/lookup.types";
import type { NextRequest } from "next/server";

const LOOKUP_PATHS: Record<LookupResource, string> = {
  brands: "/api/v1/brands",
  currencies: "/api/v1/currencies",
  "service-catalog-items": "/api/v1/service-catalog/items",
};

function isLookupResource(value: string): value is LookupResource {
  return value in LOOKUP_PATHS;
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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ resource: string }> },
) {
  const copy = getRequestDictionary(request).common.apiError;
  const { resource } = await context.params;
  const { accessToken, claim } = readSessionCookies(request.cookies);
  const session = await verifySessionClaim(claim);
  if (!accessToken || !session)
    return noStore(apiFailure(401, "session_expired", copy.unauthorized));
  if (session.actor_type === "barber")
    return noStore(apiFailure(403, "forbidden", copy.forbidden));
  if (!isLookupResource(resource))
    return noStore(apiFailure(404, "resource_not_found", copy.notFound));

  const result = await backendRequest<unknown>(LOOKUP_PATHS[resource], {
    headers: bearerHeaders(accessToken),
  });
  if (!result.ok || !Array.isArray(result.envelope?.data))
    return noStore(
      apiFailure(
        result.status || 502,
        result.envelope?.code ?? "lookup_request_failed",
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
    }));
  return noStore(apiSuccess(data));
}

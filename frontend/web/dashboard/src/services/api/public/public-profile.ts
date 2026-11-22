import type { ZodType } from "zod";

import { BACKEND_TIMEOUT_MS } from "@/config/backend.constant";
import { PUBLIC_PROFILE_API_PREFIX } from "@/config/public-profile.constant";
import { HttpStatus } from "@/enums/access/http-status.enum";
import { PublicProfileKind } from "@/enums/public/public-profile-kind.enum";
import { apiSuccessBodySchema } from "@/schemas/core/api/api-success-body.zod";
import {
  publicBranchProfileSchema,
  publicBrandProfileSchema,
  publicStylistProfileSchema,
} from "@/schemas/public/public-profile.zod";
import { readBackendUrl } from "@/services/api/auth/session-keys.util";
import type { PublicProfileTarget } from "@/types/public/public-profile-target.type";
import type {
  PublicBranchProfile,
  PublicBrandProfile,
  PublicProfileResult,
  PublicStylistProfile,
} from "@/types/public/public-profile.type";

/** Reads one public profile. A 404 is `not-found`; any other failure or an unexpected body is `unavailable`. */
async function fetchPublicProfile<T>(kind: PublicProfileKind, slug: string, schema: ZodType<T>): Promise<PublicProfileResult<T>> {
  try {
    const response = await fetch(`${readBackendUrl()}${PUBLIC_PROFILE_API_PREFIX}/${kind}/${encodeURIComponent(slug)}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
    });
    if (response.status === HttpStatus.NotFound) return { status: "not-found" };
    if (!response.ok) return { status: "unavailable" };
    const body = apiSuccessBodySchema.safeParse(await response.json().catch(() => null));
    const profile = schema.safeParse(body.success ? body.data.data : null);
    return profile.success ? { status: "found", profile: profile.data } : { status: "unavailable" };
  } catch {
    return { status: "unavailable" };
  }
}

export function fetchPublicBrand(slug: string): Promise<PublicProfileResult<PublicBrandProfile>> {
  return fetchPublicProfile(PublicProfileKind.Brand, slug, publicBrandProfileSchema);
}

export function fetchPublicBranch(slug: string): Promise<PublicProfileResult<PublicBranchProfile>> {
  return fetchPublicProfile(PublicProfileKind.Branch, slug, publicBranchProfileSchema);
}

export function fetchPublicStylist(slug: string): Promise<PublicProfileResult<PublicStylistProfile>> {
  return fetchPublicProfile(PublicProfileKind.Stylist, slug, publicStylistProfileSchema);
}

const PROFILE_SCHEMAS: Record<PublicProfileKind, ZodType<unknown>> = {
  [PublicProfileKind.Brand]: publicBrandProfileSchema,
  [PublicProfileKind.Branch]: publicBranchProfileSchema,
  [PublicProfileKind.Stylist]: publicStylistProfileSchema,
};

/** Only whether a profile exists: the proxy answers a real 404 for `not-found` before the page streams. */
export async function fetchPublicProfileStatus({ kind, slug }: PublicProfileTarget): Promise<PublicProfileResult<unknown>["status"]> {
  return (await fetchPublicProfile(kind, slug, PROFILE_SCHEMAS[kind])).status;
}

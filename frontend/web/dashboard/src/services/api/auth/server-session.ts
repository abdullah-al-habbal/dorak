import { cache } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";

import { BACKEND_PATH } from "@/config/backend.constant";
import { ACCESS_COOKIE, CLAIM_COOKIE } from "@/config/cookies.constant";
import { HttpMethod } from "@/enums/access/http-method.enum";
import type { ServerSession } from "@/interfaces/core/transport/server-session.interface";
import { meProfileSchema } from "@/schemas/account/account/me-profile.zod";
import { backendRequest } from "@/services/api/auth/backend-client";
import { actorFromClaim } from "@/services/api/auth/claim-actor.util";
import { verifyClaim } from "@/services/api/auth/jwt.util";
import { getServerLocale } from "@/locales/get-server-locale";
import type { MeProfile } from "@/types/account/profile/me-profile.type";
import type { SessionClaim } from "@/types/core/session/session-claim.type";

function profileMatchesClaim(profile: MeProfile, claim: SessionClaim): boolean {
  return (
    profile.id === claim.sub &&
    profile.actor_type === claim.actor_type &&
    profile.role === claim.role &&
    profile.branch_id === claim.branch_id
  );
}

/** Waits for a real request first: claim expiry reads the clock, which a prerender or runtime prefetch must not do. */
async function loadSession(): Promise<ServerSession | null> {
  await connection();
  const store = await cookies();
  const claimToken = store.get(CLAIM_COOKIE)?.value;
  const accessToken = store.get(ACCESS_COOKIE)?.value;
  const claim = await verifyClaim(claimToken);
  const actor = claim ? actorFromClaim(claim) : null;
  if (!claim || !actor || !accessToken) return null;

  // The backend localises `display_name`; without the page locale the Arabic header shows the English name.
  const result = await backendRequest({
    path: BACKEND_PATH.me,
    method: HttpMethod.Get,
    accessToken,
    claim: claimToken,
    locale: await getServerLocale(),
  });
  const profile = result.ok ? meProfileSchema.safeParse(result.envelope?.data) : null;
  return profile?.success && profileMatchesClaim(profile.data, claim) ? { actor, profile: profile.data } : null;
}

export const getServerSession = cache(loadSession);

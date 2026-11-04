import { cache } from "react";
import { cookies } from "next/headers";

import { BACKEND_PATH } from "@/config/backend.constant";
import { ACCESS_COOKIE, CLAIM_COOKIE } from "@/config/cookies.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import type { ServerSession } from "@/interfaces/server-session.interface";
import { meProfileSchema } from "@/schemas/me-profile.zod";
import { backendRequest } from "@/services/api/auth/backend-client";
import { actorFromClaim } from "@/services/api/auth/claim-actor.util";
import { verifyClaim } from "@/services/api/auth/jwt.util";
import type { MeProfile } from "@/types/me-profile.type";
import type { SessionClaim } from "@/types/session-claim.type";

function profileMatchesClaim(profile: MeProfile, claim: SessionClaim): boolean {
  return (
    profile.id === claim.sub &&
    profile.actor_type === claim.actor_type &&
    profile.role === claim.role &&
    profile.branch_id === claim.branch_id
  );
}

async function loadSession(): Promise<ServerSession | null> {
  const store = await cookies();
  const claimToken = store.get(CLAIM_COOKIE)?.value;
  const accessToken = store.get(ACCESS_COOKIE)?.value;
  const claim = await verifyClaim(claimToken);
  const actor = claim ? actorFromClaim(claim) : null;
  if (!claim || !actor || !accessToken) return null;

  const result = await backendRequest({
    path: BACKEND_PATH.me,
    method: HttpMethod.Get,
    accessToken,
    claim: claimToken,
  });
  const profile = result.ok ? meProfileSchema.safeParse(result.envelope?.data) : null;
  return profile?.success && profileMatchesClaim(profile.data, claim) ? { actor, profile: profile.data } : null;
}

export const getServerSession = cache(loadSession);

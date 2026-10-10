import { cookies } from "next/headers";
import { cache } from "react";
import { ROUTES } from "@/config/routes.constant";
import { ACTOR_FROM_BACKEND } from "@/services/api/auth/actors.constant";
import { backendRequest } from "@/services/api/auth/backend-client";
import { readSessionCookies } from "@/services/api/auth/cookies";
import { verifySessionClaim } from "@/services/api/auth/session.util";
import { bearerHeaders } from "@/services/api/http.util";
import type { AuthSession, BackendMeData, DashboardClaim } from "@/services/api/auth/auth.types";

function isCanonicalIdentity(me: BackendMeData, claim: DashboardClaim): boolean {
  return (
    me.id === claim.sub &&
    me.actor_type === claim.actor_type &&
    me.role === claim.role &&
    me.branch_id === (claim.branch_id ?? null) &&
    Array.isArray(me.permissions) &&
    me.permissions.every((permission) => typeof permission === "string")
  );
}

/**
 * Resolve the current session from the server-side cookies. The claim cookie
 * carries routing/identity hints, but the canonical identity is loaded from the
 * authenticated `/dashboard/me` endpoint. Request-scoped so repeated callers in
 * one render share a single backend round trip.
 */
export const getServerSession = cache(async (): Promise<AuthSession | null> => {
  const { claim: claimToken, accessToken } = readSessionCookies(await cookies());
  if (!accessToken) {
    return null;
  }

  const claim = await verifySessionClaim(claimToken);
  if (claim === null) {
    return null;
  }

  const { ok, envelope } = await backendRequest<BackendMeData>(ROUTES.api.dashboard.me, {
    headers: bearerHeaders(accessToken),
  });

  if (!ok || !envelope?.data || !isCanonicalIdentity(envelope.data, claim)) {
    return null;
  }

  const me = envelope.data;

  return {
    actor: ACTOR_FROM_BACKEND[claim.actor_type],
    actorType: claim.actor_type,
    role: claim.role,
    subject: me.id,
    branchId: me.branch_id,
    displayName: me.display_name,
    email: me.email,
    permissions: me.permissions,
    claimExpiresAt: claim.exp,
  };
});

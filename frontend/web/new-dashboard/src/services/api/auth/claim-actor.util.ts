import { ACTOR_BY_BACKEND_TYPE, ACTOR_ROLE } from "@/config/auth-actors.constant";
import type { AuthActor } from "@/enums/auth-actor.enum";
import type { SessionClaim } from "@/types/session-claim.type";

export function actorFromClaim(claim: SessionClaim): AuthActor | null {
  const actor = ACTOR_BY_BACKEND_TYPE[claim.actor_type];
  return ACTOR_ROLE[actor] === claim.role ? actor : null;
}

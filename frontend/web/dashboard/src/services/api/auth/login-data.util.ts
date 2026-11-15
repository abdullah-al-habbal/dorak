import type { AuthActor } from "@/enums/access/auth-actor.enum";
import type { SessionTokens } from "@/interfaces/core/transport/session-tokens.interface";
import { loginDataSchema } from "@/schemas/core/session/login-data.zod";
import { actorFromClaim } from "@/services/api/auth/claim-actor.util";
import { verifyClaim } from "@/services/api/auth/jwt.util";

export async function tokensFromBackendData(
  data: unknown,
  expectedActor?: AuthActor,
): Promise<SessionTokens | null> {
  const parsed = loginDataSchema.safeParse(data);
  if (!parsed.success) return null;
  const claim = await verifyClaim(parsed.data.claim);
  const actor = claim ? actorFromClaim(claim) : null;
  if (!actor || (expectedActor && actor !== expectedActor)) return null;
  return {
    claim: parsed.data.claim,
    accessToken: parsed.data.token,
    refreshToken: parsed.data.refresh_token,
    claimMaxAge: parsed.data.expires_in,
    refreshMaxAge: parsed.data.refresh_expires_in,
  };
}

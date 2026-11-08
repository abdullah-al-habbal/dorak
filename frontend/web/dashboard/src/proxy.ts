import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ACCESS_COOKIE, CLAIM_COOKIE, REFRESH_COOKIE } from "@/config/cookies.constant";
import { HttpStatus } from "@/enums/http-status.enum";
import { actorFromClaim } from "@/services/api/auth/claim-actor.util";
import { clearSessionCookies, setSessionCookies } from "@/services/api/auth/cookies";
import { verifyClaim } from "@/services/api/auth/jwt.util";
import { refreshSession } from "@/services/api/auth/refresh";
import { decideRoute } from "@/services/api/auth/route-policy.util";
import type { SessionTokens } from "@/interfaces/session-tokens.interface";

const NOT_FOUND_PATH = "/_not-found";

async function tryRefresh(request: NextRequest): Promise<SessionTokens | null> {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return null;
  return refreshSession(refreshToken, request.cookies.get(CLAIM_COOKIE)?.value);
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;
  const claim = await verifyClaim(request.cookies.get(CLAIM_COOKIE)?.value);
  let claimActor = claim ? actorFromClaim(claim) : null;
  let refreshed: SessionTokens | null = null;

  if (!claimActor) {
    refreshed = await tryRefresh(request);
    const next = refreshed ? await verifyClaim(refreshed.claim) : null;
    claimActor = next ? actorFromClaim(next) : null;
    if (!claimActor) refreshed = null;
  }

  const decision = decideRoute({
    pathname,
    search,
    claimActor,
    hasSessionCookies: [CLAIM_COOKIE, ACCESS_COOKIE, REFRESH_COOKIE].some((name) => request.cookies.has(name)),
  });

  if (decision.kind === "not-found") return NextResponse.rewrite(new URL(NOT_FOUND_PATH, request.url), { status: HttpStatus.NotFound });

  // A refreshed session on a pass-through request is replayed as a redirect so the new cookies reach the server render.
  const location =
    decision.kind === "redirect" ? decision.location : refreshed ? pathname + search : undefined;
  const response = location ? NextResponse.redirect(new URL(location, request.url)) : NextResponse.next();
  if (refreshed) setSessionCookies(response, refreshed);
  if (decision.clearCookies) clearSessionCookies(response);
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

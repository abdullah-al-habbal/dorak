import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROUTES } from "@/config/routes.constant";
import { ACTOR_FROM_BACKEND } from "@/services/api/auth/actors.constant";
import {
  applySessionCookies,
  clearSessionCookies,
  readSessionCookies,
} from "@/services/api/auth/cookies";
import {
  isProtectedPath,
  isPublicPath,
  loginActorFromPath,
  portalActorFromPath,
  redirectTargetForPath,
} from "@/services/api/auth/route-policy.util";
import { refreshDashboardSession } from "@/services/api/auth/session.mutation";
import { verifySessionClaim } from "@/services/api/auth/session.util";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith(ROUTES.api.root) || isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const cookies = readSessionCookies(request.cookies);
  const loginActor = loginActorFromPath(pathname);
  const claim = await verifySessionClaim(cookies.claim);

  if (claim === null) {
    const refreshed = cookies.refreshToken
      ? await refreshDashboardSession(cookies.refreshToken, cookies.claim)
      : null;
    if (refreshed) {
      const response = NextResponse.redirect(request.nextUrl.clone());
      applySessionCookies(response, refreshed.cookies);

      return response;
    }

    if (loginActor !== null || !isProtectedPath(pathname)) {
      return NextResponse.next();
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = ROUTES.portal[redirectTargetForPath(pathname)].login;
    loginUrl.search = "";
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);

    const response = NextResponse.redirect(loginUrl);
    clearSessionCookies(response);

    return response;
  }

  const sessionActor = ACTOR_FROM_BACKEND[claim.actor_type];
  const requiredActor = portalActorFromPath(pathname);

  if (
    loginActor !== null ||
    (requiredActor !== null && requiredActor !== sessionActor)
  ) {
    return NextResponse.redirect(
      new URL(ROUTES.portal[sessionActor].root, request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  // Next.js requires this matcher to be a literal for build-time extraction.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico|css|js|map|woff|woff2|ttf)$).*)",
  ],
};

import { NextResponse, type NextRequest } from 'next/server';
import { canAccessPathname, dashboardClaimCookieName, homePathForClaim } from '@/shared/auth';
import { verifyDashboardClaim } from '@/shared/auth/verify-dashboard-claim';
import { APP_ROUTES } from '@/shared/routes/app-routes.const';

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const claim = await verifyDashboardClaim(request.cookies.get(dashboardClaimCookieName)?.value);
  const { pathname } = request.nextUrl;

  if (pathname === APP_ROUTES.login) {
    return claim === null ? NextResponse.next() : redirect(request, homePathForClaim(claim));
  }

  if (claim === null) {
    return redirect(request, APP_ROUTES.login);
  }

  return canAccessPathname(claim, pathname)
    ? NextResponse.next()
    : redirect(request, homePathForClaim(claim));
}

function redirect(request: NextRequest, path: string): NextResponse {
  return NextResponse.redirect(new URL(path, request.url));
}

/**
 * Next.js reads `matcher` statically at build time, so these stay string
 * literals. They must mirror the areas in `src/shared/auth`: `admin` for the
 * platform admin, `manager` for the branch manager.
 */
export const config = {
  matcher: ['/admin/:path*', '/manager/:path*', '/login'],
};

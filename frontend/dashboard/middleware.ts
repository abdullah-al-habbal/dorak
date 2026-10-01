import { NextResponse, type NextRequest } from 'next/server';
import { dashboardClaimCookieName, verifyDashboardClaim } from '@/shared/auth/dashboard-claim';

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const claim = await verifyDashboardClaim(request.cookies.get(dashboardClaimCookieName)?.value);
  const { pathname } = request.nextUrl;

  if (pathname === '/login') {
    if (claim?.role === 'platform_admin') {
      return redirect(request, '/admin');
    }
    if (claim?.role === 'branch_manager') {
      return redirect(request, '/manager');
    }
    return NextResponse.next();
  }

  if (claim === null) {
    return redirect(request, '/login');
  }
  if (pathname.startsWith('/admin') && claim.role !== 'platform_admin') {
    return redirect(request, '/manager');
  }
  if (pathname.startsWith('/manager') && claim.role !== 'branch_manager') {
    return redirect(request, '/admin');
  }

  return NextResponse.next();
}

function redirect(request: NextRequest, path: string): NextResponse {
  return NextResponse.redirect(new URL(path, request.url));
}

export const config = {
  matcher: ['/admin/:path*', '/manager/:path*', '/login'],
};

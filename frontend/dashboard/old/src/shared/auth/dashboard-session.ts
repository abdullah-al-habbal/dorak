import type { NextResponse } from 'next/server';
import { dashboardClaimCookieName } from '@/shared/auth/claim-cookie';

export const dashboardTokenCookieName = 'dorak_dashboard_token';

type DashboardSession = {
  readonly claim: string;
  readonly expiresIn: number;
  readonly token: string;
};

const cookieBase = {
  httpOnly: true,
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env['NODE_ENV'] === 'production',
};

export function setDashboardSession(response: NextResponse, session: DashboardSession): void {
  response.cookies.set(dashboardClaimCookieName, session.claim, {
    ...cookieBase,
    maxAge: session.expiresIn,
  });
  response.cookies.set(dashboardTokenCookieName, session.token, {
    ...cookieBase,
    maxAge: session.expiresIn,
  });
}

export function clearDashboardSession(response: NextResponse): void {
  response.cookies.set(dashboardClaimCookieName, '', { ...cookieBase, maxAge: 0 });
  response.cookies.set(dashboardTokenCookieName, '', { ...cookieBase, maxAge: 0 });
}

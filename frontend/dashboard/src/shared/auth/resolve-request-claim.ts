import { cookies } from 'next/headers';
import { dashboardClaimCookieName } from '@/shared/auth/claim-cookie';
import type { DashboardClaim } from '@/shared/auth/types/dashboard-claim';
import { verifyDashboardClaim } from '@/shared/auth/verify-dashboard-claim';

/**
 * Reads and verifies the claim cookie for a server component. Middleware has
 * already rejected a missing or invalid claim, so callers still treat `null` as
 * a not-found rather than assuming a session exists.
 */
export async function resolveRequestClaim(): Promise<DashboardClaim | null> {
  return verifyDashboardClaim((await cookies()).get(dashboardClaimCookieName)?.value);
}

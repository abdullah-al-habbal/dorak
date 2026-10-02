import { cookies } from 'next/headers';
import { dashboardClaimCookieName } from '@/shared/auth/claim-cookie';
import type { DashboardClaim } from '@/shared/auth/types/dashboard-claim';
import { verifyDashboardClaim } from '@/shared/auth/verify-dashboard-claim';

/**
 * Reads and verifies the dashboard claim attached to the current server
 * request. Consumers must handle `null`, since public routes may not have a
 * session and an expired or malformed cookie is intentionally ignored.
 */
export async function getDashboardClaim(): Promise<DashboardClaim | null> {
  return verifyDashboardClaim((await cookies()).get(dashboardClaimCookieName)?.value);
}

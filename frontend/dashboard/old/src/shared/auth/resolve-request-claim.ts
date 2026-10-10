import { getDashboardClaim } from '@/shared/auth/get-dashboard-claim';
import type { DashboardClaim } from '@/shared/auth/types/dashboard-claim';

/**
 * Reads and verifies the claim cookie for a server component. Middleware has
 * already rejected a missing or invalid claim, so callers still treat `null` as
 * a not-found rather than assuming a session exists.
 */
export async function resolveRequestClaim(): Promise<DashboardClaim | null> {
  return getDashboardClaim();
}

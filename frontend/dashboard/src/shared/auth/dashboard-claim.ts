import { jwtVerify } from 'jose';
import type { DashboardClaim } from '@/shared/types/auth';

export type { DashboardClaim, DashboardRole } from '@/shared/types/auth';

export const dashboardClaimCookieName = 'dorak_dashboard_claim';

export async function verifyDashboardClaim(
  token: string | undefined,
): Promise<DashboardClaim | null> {
  const secret = process.env['DASHBOARD_SESSION_SECRET'];
  if (token === undefined || secret === undefined || secret.length < 32) {
    return null;
  }

  try {
    const verified = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ['HS256'],
      issuer: 'dorak-backend',
    });
    const { sub, actor_type: actorType, role, branch_id: branchId } = verified.payload;
    if (
      typeof sub !== 'string' ||
      (actorType !== 'admin' && actorType !== 'branch') ||
      (role !== 'platform_admin' && role !== 'branch_manager') ||
      (branchId !== undefined && typeof branchId !== 'string')
    ) {
      return null;
    }

    return { subject: sub, actorType, role, branchId };
  } catch (error) {
    if (error instanceof Error) {
      return null;
    }
    return null;
  }
}

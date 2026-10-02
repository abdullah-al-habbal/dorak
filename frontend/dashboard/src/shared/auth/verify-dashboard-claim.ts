import { jwtVerify } from 'jose';
import { isDashboardRole } from '@/shared/auth/enums/dashboard-roles';
import { requiresBranchScope } from '@/shared/auth/rbac';
import { isDashboardActorType } from '@/shared/auth/types/dashboard-actor-type';
import type { DashboardClaim } from '@/shared/auth/types/dashboard-claim';

const claimIssuer = 'dorak-backend';
const claimAlgorithm = 'HS256';
const minimumSecretLength = 32;

export async function verifyDashboardClaim(
  token: string | undefined,
): Promise<DashboardClaim | null> {
  const secret = process.env['DASHBOARD_SESSION_SECRET'];
  if (token === undefined || secret === undefined || secret.length < minimumSecretLength) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: [claimAlgorithm],
      issuer: claimIssuer,
    });

    return toDashboardClaim(payload);
  } catch {
    return null;
  }
}

/**
 * A claim is only trustworthy when it is internally consistent: a branch
 * manager must carry the branch it is scoped to and a platform admin must not.
 * Anything else is rejected instead of degrading into an unscoped manager.
 */
function toDashboardClaim(payload: Record<string, unknown>): DashboardClaim | null {
  const { sub, actor_type: actorType, role, branch_id: branchId } = payload;
  if (
    typeof sub !== 'string' ||
    !isDashboardActorType(actorType) ||
    !isDashboardRole(role) ||
    (branchId !== undefined && typeof branchId !== 'string') ||
    requiresBranchScope(role) !== (typeof branchId === 'string')
  ) {
    return null;
  }

  return { subject: sub, actorType, role, branchId };
}

import { adminArea, managerArea, type DashboardArea } from '@/shared/auth/enums/dashboard-areas';
import {
  branchManagerRole,
  platformAdminRole,
  type DashboardRole,
} from '@/shared/auth/enums/dashboard-roles';
import type { DashboardClaim } from '@/shared/auth/types/dashboard-claim';

/**
 * The single role-to-area mapping for the dashboard. `satisfies` keeps it
 * exhaustive in both directions at compile time, so a third role or a renamed
 * area fails `npm run typecheck` instead of silently mis-routing a user.
 */
const roleAreas = {
  [platformAdminRole]: adminArea,
  [branchManagerRole]: managerArea,
} as const satisfies Record<DashboardRole, DashboardArea>;

export function areaForRole(role: DashboardRole): DashboardArea {
  return roleAreas[role];
}

export function hasAnyRole(claim: DashboardClaim, roles: readonly DashboardRole[]): boolean {
  return roles.includes(claim.role);
}

export function canAccessArea(claim: DashboardClaim, area: DashboardArea): boolean {
  return areaForRole(claim.role) === area;
}

/**
 * Branch scope is what separates the two actors: the platform admin is
 * unscoped and reads across every branch, the branch manager is pinned to the
 * one branch carried on the claim. Mirrors the Laravel `DashboardActor`.
 */
export function requiresBranchScope(role: DashboardRole): boolean {
  return areaForRole(role) === managerArea;
}

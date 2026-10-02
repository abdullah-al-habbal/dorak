import { dashboardAreas, type DashboardArea } from '@/shared/auth/enums/dashboard-areas';
import { areaForRole, canAccessArea } from '@/shared/auth/rbac';
import type { DashboardClaim } from '@/shared/auth/types/dashboard-claim';

export function areaForPathname(pathname: string): DashboardArea | undefined {
  return dashboardAreas.find((area) => pathname === `/${area}` || pathname.startsWith(`/${area}/`));
}

export function canAccessPathname(claim: DashboardClaim, pathname: string): boolean {
  const area = areaForPathname(pathname);
  return area === undefined || canAccessArea(claim, area);
}

export function homePathForClaim(claim: DashboardClaim): `/${DashboardArea}` {
  return `/${areaForRole(claim.role)}`;
}

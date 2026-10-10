export { dashboardClaimCookieName } from './claim-cookie';
export {
  adminArea,
  dashboardAreas,
  isDashboardArea,
  managerArea,
  type DashboardArea,
} from './enums/dashboard-areas';
export {
  branchManagerRole,
  dashboardRoles,
  isDashboardRole,
  platformAdminRole,
  type DashboardRole,
} from './enums/dashboard-roles';
export { areaForRole, canAccessArea, hasAnyRole, requiresBranchScope } from './rbac';
export { areaForPathname, canAccessPathname, homePathForClaim } from './route-guard';
export { isDashboardActorType, type DashboardActorType } from './types/dashboard-actor-type';
export type { DashboardClaim } from './types/dashboard-claim';

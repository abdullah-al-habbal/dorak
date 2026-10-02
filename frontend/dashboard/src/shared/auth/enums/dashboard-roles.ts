export const dashboardRoles = ['platform_admin', 'branch_manager'] as const;

export type DashboardRole = (typeof dashboardRoles)[number];

export const platformAdminRole = 'platform_admin' satisfies DashboardRole;

export const branchManagerRole = 'branch_manager' satisfies DashboardRole;

export function isDashboardRole(value: unknown): value is DashboardRole {
  return typeof value === 'string' && (dashboardRoles as readonly string[]).includes(value);
}

export const dashboardAreas = ['admin', 'manager'] as const;

export type DashboardArea = (typeof dashboardAreas)[number];

export const adminArea = 'admin' satisfies DashboardArea;

export const managerArea = 'manager' satisfies DashboardArea;

export function isDashboardArea(value: unknown): value is DashboardArea {
  return typeof value === 'string' && (dashboardAreas as readonly string[]).includes(value);
}

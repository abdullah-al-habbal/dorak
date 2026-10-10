import { dashboardApi } from '@/shared/api/client';
import { DASHBOARD_API } from '@/shared/routes/dashboard-api.const';
import type { DashboardOverview } from './overview-wire';

export function getOverview(): Promise<DashboardOverview> {
  return dashboardApi(DASHBOARD_API.overview);
}

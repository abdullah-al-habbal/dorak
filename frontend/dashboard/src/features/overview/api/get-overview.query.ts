import { dashboardApi } from '@/shared/api/client';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { DashboardOverview } from './overview-wire';

export const getOverview = (): Promise<DashboardOverview> => dashboardApi(DASHBOARD_API.overview);

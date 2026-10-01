import type { DashboardOverview } from '@/features/overview/types/overview';
import { dashboardApi } from '@/shared/api/client';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';

export const getOverview = (): Promise<DashboardOverview> => dashboardApi(DASHBOARD_API.overview);

import { dashboardApi } from '@/shared/api/client';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
export interface DashboardOverview { active_chairs_count: number; active_branches_count: number; bookings_count: number; completed_bookings_count: number; revenue: number; stylists_count: number; today_bookings_count: number; }
export const getOverview = (): Promise<DashboardOverview> => dashboardApi(DASHBOARD_API.overview);

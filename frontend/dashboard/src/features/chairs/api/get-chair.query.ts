import { dashboardApi } from '@/shared/api/client';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { Chair } from '@/features/chairs/types/chair';

export const getChair = (id: string): Promise<Chair> => dashboardApi(`${DASHBOARD_API.chairs}/${id}`);

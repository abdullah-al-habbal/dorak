import { dashboardApi } from '@/shared/api/client';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { Service } from '@/features/services/types/service';

export const getService = (id: string): Promise<Service> => dashboardApi(`${DASHBOARD_API.services}/${id}`);

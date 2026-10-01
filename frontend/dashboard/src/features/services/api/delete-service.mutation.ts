import { dashboardApi } from '@/shared/api/client';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';

export const deleteService = (id: string): Promise<void> => dashboardApi(`${DASHBOARD_API.services}/${id}`, { method: 'DELETE' });

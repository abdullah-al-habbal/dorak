import { dashboardApi } from '@/shared/api/client';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';

export const deleteStylist = (id: string): Promise<void> => dashboardApi(`${DASHBOARD_API.stylists}/${id}`, { method: 'DELETE' });

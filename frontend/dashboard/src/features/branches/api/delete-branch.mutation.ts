import { dashboardApi } from '@/shared/api/client';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';

export const deleteBranch = (id: string): Promise<void> => dashboardApi(`${DASHBOARD_API.branches}/${id}`, { method: 'DELETE' });

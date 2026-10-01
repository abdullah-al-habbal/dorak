import { fetchEntity } from '@/shared/api';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { Chair } from '@/features/chairs/types/chair';

export const getChair = (id: string): Promise<Chair> => fetchEntity<Chair>(DASHBOARD_API.chairs, id);

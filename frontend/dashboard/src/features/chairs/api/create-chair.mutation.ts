import { dashboardApi } from '@/shared/api/client';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { ChairInput } from '@/features/chairs/schemas/chair.schema';
import type { Chair } from '@/features/chairs/types/chair';

export const createChair = (input: ChairInput): Promise<Chair> => dashboardApi(DASHBOARD_API.chairs, { body: JSON.stringify(input), headers: { 'Content-Type': 'application/json' }, method: 'POST' });

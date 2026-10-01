import { dashboardApi } from '@/shared/api/client';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { ChairInput } from '@/features/chairs/schemas/chair.schema';
import type { Chair } from '@/features/chairs/types/chair';

export const updateChair = (id: string, input: ChairInput): Promise<Chair> => dashboardApi(`${DASHBOARD_API.chairs}/${id}`, { body: JSON.stringify(input), headers: { 'Content-Type': 'application/json' }, method: 'PUT' });

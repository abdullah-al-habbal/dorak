import type { ChairInput } from '@/features/chairs/schemas/chair.schema';
import type { Chair } from '@/features/chairs/types/chair';
import { mutateEntity } from '@/shared/api';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';

export const updateChair = (id: string, input: ChairInput): Promise<Chair> =>
  mutateEntity<ChairInput, Chair>(`${DASHBOARD_API.chairs}/${id}`, 'PUT', input);

import { mutateEntity } from '@/shared/api';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { ChairInput } from '@/features/chairs/schemas/chair.schema';
import type { Chair } from '@/features/chairs/types/chair';

export const createChair = (input: ChairInput): Promise<Chair> => mutateEntity<ChairInput, Chair>(DASHBOARD_API.chairs, 'POST', input);

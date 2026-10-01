import { mutateEntity } from '@/shared/api';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';

export const deleteChair = (id: string): Promise<void> => mutateEntity<never, void>(`${DASHBOARD_API.chairs}/${id}`, 'DELETE');

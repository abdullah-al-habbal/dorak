import type { Service } from '@/features/services/types/service';
import { fetchEntity } from '@/shared/api';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';

export const getService = (id: string): Promise<Service> =>
  fetchEntity<Service>(DASHBOARD_API.services, id);

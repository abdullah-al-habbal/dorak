import { fetchEntity } from '@/shared/api';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { Service } from '@/features/services/types/service';

export const getService = (id: string): Promise<Service> => fetchEntity<Service>(DASHBOARD_API.services, id);

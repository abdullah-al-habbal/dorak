import { dashboardApi } from '@/shared/api/client';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { ServiceInput } from '@/features/services/schemas/service.schema';
import type { Service } from '@/features/services/types/service';

export const createService = (input: ServiceInput): Promise<Service> => dashboardApi(DASHBOARD_API.services, { body: JSON.stringify(input), headers: { 'Content-Type': 'application/json' }, method: 'POST' });

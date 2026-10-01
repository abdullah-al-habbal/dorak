import { dashboardApi } from '@/shared/api/client';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { ServiceInput } from '@/features/services/schemas/service.schema';
import type { Service } from '@/features/services/types/service';

export const updateService = (id: string, input: ServiceInput): Promise<Service> => dashboardApi(`${DASHBOARD_API.services}/${id}`, { body: JSON.stringify(input), headers: { 'Content-Type': 'application/json' }, method: 'PUT' });

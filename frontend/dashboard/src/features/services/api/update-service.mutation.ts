import { mutateEntity } from '@/shared/api';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { ServiceInput } from '@/features/services/schemas/service.schema';
import type { Service } from '@/features/services/types/service';

export const updateService = (id: string, input: ServiceInput): Promise<Service> => mutateEntity<ServiceInput, Service>(`${DASHBOARD_API.services}/${id}`, 'PUT', input);

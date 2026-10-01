import { dashboardApi } from '@/shared/api/client';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { StylistInput } from '@/features/stylists/schemas/stylist.schema';
import type { Stylist } from '@/features/stylists/types/stylist';

export const updateStylist = (id: string, input: StylistInput): Promise<Stylist> => dashboardApi(`${DASHBOARD_API.stylists}/${id}`, { body: JSON.stringify(input), headers: { 'Content-Type': 'application/json' }, method: 'PUT' });

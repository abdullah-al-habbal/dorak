import { mutateEntity } from '@/shared/api';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { StylistInput } from '@/features/stylists/schemas/stylist.schema';
import type { Stylist } from '@/features/stylists/types/stylist';

export const updateStylist = (id: string, input: StylistInput): Promise<Stylist> => mutateEntity<StylistInput, Stylist>(`${DASHBOARD_API.stylists}/${id}`, 'PUT', input);

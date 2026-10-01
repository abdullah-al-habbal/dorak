import { fetchEntity } from '@/shared/api';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { Stylist } from '@/features/stylists/types/stylist';

export const getStylist = (id: string): Promise<Stylist> => fetchEntity<Stylist>(DASHBOARD_API.stylists, id);

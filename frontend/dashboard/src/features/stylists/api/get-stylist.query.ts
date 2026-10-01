import { dashboardApi } from '@/shared/api/client';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { Stylist } from '@/features/stylists/types/stylist';

export const getStylist = (id: string): Promise<Stylist> => dashboardApi(`${DASHBOARD_API.stylists}/${id}`);

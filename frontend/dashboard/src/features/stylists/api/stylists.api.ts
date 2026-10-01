import { dashboardApi, dashboardApiEnvelope } from '@/shared/api/client';
import type { DashboardPage } from '@/shared/types/pagination';
import type { ServerListParams } from '@/shared/hooks/use-server-query-params';
import type { StylistInput } from '@/features/stylists/schemas/stylist.schema';
import type { Stylist } from '@/features/stylists/types/stylist';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
export async function listStylists(params: ServerListParams): Promise<DashboardPage<Stylist>> { const query = new URLSearchParams({ page: String(params.page), per_page: String(params.per_page) }); if (params.search !== undefined) query.set('search', params.search); const envelope = await dashboardApiEnvelope<Stylist[]>(`${DASHBOARD_API.stylists}?${query.toString()}`); const pagination = envelope.meta?.pagination; return { items: envelope.data, pagination: { currentPage: pagination?.current_page ?? 1, perPage: pagination?.per_page ?? envelope.data.length, total: pagination?.total ?? envelope.data.length, totalPages: pagination?.total_pages ?? 1 } }; }
export const createStylist = (input: StylistInput): Promise<Stylist> => dashboardApi(DASHBOARD_API.stylists, { body: JSON.stringify(input), headers: { 'Content-Type': 'application/json' }, method: 'POST' });
export const getStylist = (id: string): Promise<Stylist> => dashboardApi(`${DASHBOARD_API.stylists}/${id}`);
export const updateStylist = (id: string, input: StylistInput): Promise<Stylist> => dashboardApi(`${DASHBOARD_API.stylists}/${id}`, { body: JSON.stringify(input), headers: { 'Content-Type': 'application/json' }, method: 'PUT' });
export const deleteStylist = (id: string): Promise<void> => dashboardApi(`${DASHBOARD_API.stylists}/${id}`, { method: 'DELETE' });

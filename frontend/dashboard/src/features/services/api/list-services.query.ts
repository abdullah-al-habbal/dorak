import { dashboardApiEnvelope } from '@/shared/api/client';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { ServerListParams } from '@/shared/hooks/use-server-query-params';
import type { DashboardPage } from '@/shared/types/pagination';
import type { Service } from '@/features/services/types/service';

export async function listServices(params: ServerListParams): Promise<DashboardPage<Service>> { const query = new URLSearchParams({ page: String(params.page), per_page: String(params.per_page) }); if (params.search !== undefined) query.set('search', params.search); const envelope = await dashboardApiEnvelope<Service[]>(`${DASHBOARD_API.services}?${query.toString()}`); const pagination = envelope.meta?.pagination; return { items: envelope.data, pagination: { currentPage: pagination?.current_page ?? 1, perPage: pagination?.per_page ?? envelope.data.length, total: pagination?.total ?? envelope.data.length, totalPages: pagination?.total_pages ?? 1 } }; }

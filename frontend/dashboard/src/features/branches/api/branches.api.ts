import { dashboardApi, dashboardApiEnvelope } from '@/shared/api/client';
import type { ServerListParams } from '@/shared/hooks/use-server-query-params';
import type { DashboardPage } from '@/shared/types/pagination';
import type { CreateBranchInput, UpdateBranchInput } from '@/features/branches/schemas/branch.schema';
import type { Branch } from '@/features/branches/types/branch';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';

export async function listBranches(params: ServerListParams): Promise<DashboardPage<Branch>> {
  const search = new URLSearchParams({ page: String(params.page), per_page: String(params.per_page) });
  if (params.search !== undefined) search.set('search', params.search);
  const envelope = await dashboardApiEnvelope<Branch[]>(`${DASHBOARD_API.branches}?${search.toString()}`);
  const pagination = envelope.meta?.pagination;
  return { items: envelope.data, pagination: { currentPage: pagination?.current_page ?? 1, perPage: pagination?.per_page ?? envelope.data.length, total: pagination?.total ?? envelope.data.length, totalPages: pagination?.total_pages ?? 1 } };
}

export const getBranch = (id: string): Promise<Branch> => dashboardApi(`${DASHBOARD_API.branches}/${id}`);
export const createBranch = (input: CreateBranchInput): Promise<Branch> => dashboardApi(DASHBOARD_API.branches, { body: JSON.stringify(input), headers: { 'Content-Type': 'application/json' }, method: 'POST' });
export const updateBranch = (id: string, input: UpdateBranchInput): Promise<Branch> => dashboardApi(`${DASHBOARD_API.branches}/${id}`, { body: JSON.stringify(input), headers: { 'Content-Type': 'application/json' }, method: 'PUT' });
export const deleteBranch = (id: string): Promise<void> => dashboardApi(`${DASHBOARD_API.branches}/${id}`, { method: 'DELETE' });

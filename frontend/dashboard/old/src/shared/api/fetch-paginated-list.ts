import { dashboardApiEnvelope } from '@/shared/api/client';
import type { DashboardPage } from '@/shared/types/pagination/dashboard-page';

function isSerializable(value: unknown): value is boolean | number | string {
  return typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string';
}

export async function fetchPaginatedList<TItem, TParams extends object>(
  endpoint: string,
  params?: TParams,
): Promise<DashboardPage<TItem>> {
  const query = new URLSearchParams();
  if (params !== undefined) {
    for (const [key, value] of Object.entries(params)) {
      if (isSerializable(value) && value !== '') {
        query.set(key, String(value));
      }
    }
  }
  const queryString = query.toString();
  const envelope = await dashboardApiEnvelope<TItem[]>(
    queryString === '' ? endpoint : `${endpoint}?${queryString}`,
  );
  const pagination = envelope.meta?.pagination;
  return {
    items: envelope.data,
    pagination: {
      currentPage: pagination?.current_page ?? 1,
      perPage: pagination?.per_page ?? envelope.data.length,
      total: pagination?.total ?? envelope.data.length,
      totalPages: pagination?.total_pages ?? 1,
    },
  };
}

import { dashboardApi } from '@/shared/api/client';

export function fetchEntity<TResponse>(endpoint: string, id: string): Promise<TResponse> {
  return dashboardApi(`${endpoint}/${id}`);
}

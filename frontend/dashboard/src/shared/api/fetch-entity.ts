import { dashboardApi } from '@/shared/api/client';

export function fetchEntity<TResponse>(endpoint: string, id: string): Promise<TResponse> {
  return fetchEntityAt<TResponse>(`${endpoint}/${id}`);
}

export function fetchEntityAt<TResponse>(url: string): Promise<TResponse> {
  return dashboardApi(url);
}

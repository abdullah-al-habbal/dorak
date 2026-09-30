import { DashboardApiError } from '@/shared/api/dashboard-api-error';
import { publishDashboardApiError } from '@/shared/api/error-events';
import type { ApiEnvelope, ApiErrorPayload } from '@/shared/types/api';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export async function dashboardApi<TData>(path: string, init: RequestInit = {}): Promise<TData> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...init.headers,
    },
  });

  const payload = await parsePayload(response);
  if (!response.ok || !isSuccessfulEnvelope(payload)) {
    const error = new DashboardApiError(response.status, payload ?? {});
    publishDashboardApiError(error);
    throw error;
  }

  return payload.data;
}

async function parsePayload(response: Response): Promise<ApiEnvelope<never> | ApiErrorPayload | null> {
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) return null;

  return response.json() as Promise<ApiEnvelope<never> | ApiErrorPayload>;
}

function isSuccessfulEnvelope(payload: ApiEnvelope<never> | ApiErrorPayload | null): payload is ApiEnvelope<never> {
  return payload !== null && 'success' in payload && payload.success === true && 'data' in payload;
}

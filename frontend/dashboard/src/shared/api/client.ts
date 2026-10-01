import { DashboardApiError } from '@/shared/api/dashboard-api-error';
import { publishDashboardApiError } from '@/shared/api/error-events';
import type { ApiEnvelope, ApiErrorPayload } from '@/shared/types/api';
import { dashboardLocaleCookie, isDashboardLocale } from '@/shared/i18n/locale';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export async function dashboardApi<TData>(path: string, init: RequestInit = {}): Promise<TData> {
  const envelope = await dashboardApiEnvelope<TData>(path, init);

  return envelope.data;
}

export async function dashboardApiEnvelope<TData>(path: string, init: RequestInit = {}): Promise<ApiEnvelope<TData>> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Accept-Language': dashboardLocale(),
      ...init.headers,
    },
  });

  const payload = await parsePayload(response);
  if (!response.ok || !isSuccessfulEnvelope(payload)) {
    const error = new DashboardApiError(response.status, payload ?? {});
    publishDashboardApiError(error);
    throw error;
  }

  return payload;
}

function dashboardLocale(): string {
  if (typeof document === 'undefined') return 'en';

  const value = document.cookie.split('; ').find((cookie) => cookie.startsWith(`${dashboardLocaleCookie}=`))?.split('=')[1];

  return isDashboardLocale(value) ? value : 'en';
}

async function parsePayload(response: Response): Promise<ApiEnvelope<never> | ApiErrorPayload | null> {
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) return null;

  return response.json() as Promise<ApiEnvelope<never> | ApiErrorPayload>;
}

function isSuccessfulEnvelope(payload: ApiEnvelope<unknown> | ApiErrorPayload | null): payload is ApiEnvelope<unknown> {
  return payload !== null && 'success' in payload && payload.success === true && 'data' in payload;
}

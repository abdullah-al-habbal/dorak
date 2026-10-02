import { DashboardApiError, requestLocale } from '@/shared/api/dashboard-api-error';
import { interceptApiError } from '@/shared/api/error-interceptor';
import { dashboardLocaleCookie, isDashboardLocale } from '@/shared/i18n/locale';
import { translate } from '@/shared/i18n/translate';
import type { ApiEnvelope } from '@/shared/types/api/api-envelope-wire';
import type { ApiErrorPayload } from '@/shared/types/api/api-error-payload-wire';

const apiBaseUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:8000/api/v1';

export async function dashboardApi<TData>(path: string, init: RequestInit = {}): Promise<TData> {
  const envelope = await dashboardApiEnvelope<TData>(path, init);

  return envelope.data;
}

export async function dashboardApiEnvelope<TData>(
  path: string,
  init: RequestInit = {},
): Promise<ApiEnvelope<TData>> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Accept-Language': dashboardLocale(),
        ...init.headers,
      },
    });
  } catch {
    const error = new DashboardApiError(
      0,
      { message: translate(requestLocale(), 'http.network') },
      requestLocale(),
    );
    interceptApiError(error);
    throw error;
  }

  const payload = await parsePayload(response);
  if (!response.ok || !isSuccessfulEnvelope(payload)) {
    const error = new DashboardApiError(response.status, payload ?? {}, requestLocale());
    interceptApiError(error);
    throw error;
  }

  return payload;
}

function dashboardLocale(): string {
  if (typeof document === 'undefined') {
    return 'en';
  }

  const value = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${dashboardLocaleCookie}=`))
    ?.split('=')[1];

  return isDashboardLocale(value) ? value : 'en';
}

async function parsePayload(
  response: Response,
): Promise<ApiEnvelope<never> | ApiErrorPayload | null> {
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    return null;
  }

  try {
    return (await response.json()) as ApiEnvelope<never> | ApiErrorPayload;
  } catch {
    return null;
  }
}

function isSuccessfulEnvelope(
  payload: ApiEnvelope<unknown> | ApiErrorPayload | null,
): payload is ApiEnvelope<unknown> {
  return payload !== null && 'success' in payload && payload.success === true && 'data' in payload;
}

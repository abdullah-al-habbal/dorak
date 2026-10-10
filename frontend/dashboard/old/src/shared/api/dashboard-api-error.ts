import type { DashboardLocale } from '@/shared/i18n/dashboard-locale.type';
import { dashboardLocaleCookie } from '@/shared/i18n/dashboard-locales.const';
import { isDashboardLocale } from '@/shared/i18n/locale.util';
import { httpMessageKey, translate } from '@/shared/i18n/translate';
import type { ApiErrorPayload } from '@/shared/types/api/api-error-payload-wire';

export class DashboardApiError extends Error {
  public readonly details: Record<string, string[]>;

  public readonly requestId?: string | undefined;

  public constructor(
    public readonly status: number,
    payload: ApiErrorPayload = {},
    locale: DashboardLocale = 'en',
  ) {
    super(payload.message ?? translate(locale, httpMessageKey(status)));
    this.name = 'DashboardApiError';
    this.details = payload.errors ?? {};
    this.requestId = payload.request_id;
  }
}

export function isDashboardApiError(error: unknown): error is DashboardApiError {
  return error instanceof DashboardApiError;
}

/**
 * The API layer runs outside React, so the fallback message for a missing
 * server payload is localized from the same cookie the request sends.
 */
export function requestLocale(): DashboardLocale {
  if (typeof document === 'undefined') {
    return 'en';
  }
  const cookie = document.cookie
    .split(';')
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${dashboardLocaleCookie}=`));
  const value = cookie?.slice(`${dashboardLocaleCookie}=`.length);
  return isDashboardLocale(value) ? value : 'en';
}

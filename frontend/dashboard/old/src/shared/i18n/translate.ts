import type { DashboardLocale } from '@/shared/i18n/dashboard-locale.type';
import { dashboardMessages, type DashboardMessageKey } from '@/shared/i18n/messages';

/**
 * Resolves a message outside React. The API layer and the error class run
 * below the component tree, so they cannot call `useDashboardTranslation` and
 * take the locale from a cookie instead.
 */
export function translate(
  locale: DashboardLocale,
  key: DashboardMessageKey,
  values: Record<string, string | number> = {},
): string {
  const [section, entry] = key.split('.') as [keyof typeof dashboardMessages.en, string];
  const message = dashboardMessages[locale][section][entry as never] as string;
  return Object.entries(values).reduce(
    (result, [name, value]) => result.replace(`{${name}}`, String(value)),
    message,
  );
}

/**
 * HTTP failures are mostly localized by the server's own payload. These keys
 * are the fallback for a missing message, so they follow the active locale.
 */
export function httpMessageKey(status: number): DashboardMessageKey {
  if (status === 401) {
    return 'http.unauthorized';
  }
  if (status === 403) {
    return 'http.forbidden';
  }
  if (status === 409) {
    return 'http.conflict';
  }
  if (status === 422) {
    return 'http.unprocessable';
  }
  if (status >= 500) {
    return 'http.server';
  }
  return 'http.unknown';
}

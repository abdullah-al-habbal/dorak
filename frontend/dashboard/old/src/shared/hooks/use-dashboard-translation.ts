'use client';

import { useDashboardLocale } from '@/shared/hooks/use-dashboard-locale';
import { dashboardMessages, type DashboardMessageKey } from '@/shared/i18n/messages';

export function useDashboardTranslation(): {
  t: (key: DashboardMessageKey, values?: Record<string, string | number>) => string;
} {
  const { locale } = useDashboardLocale();
  return {
    t: (key, values = {}) => {
      const [section, entry] = key.split('.') as [keyof typeof dashboardMessages.en, string];
      const message = dashboardMessages[locale][section][entry as never] as string;
      return Object.entries(values).reduce(
        (result, [name, value]) => result.replace(`{${name}}`, String(value)),
        message,
      );
    },
  };
}

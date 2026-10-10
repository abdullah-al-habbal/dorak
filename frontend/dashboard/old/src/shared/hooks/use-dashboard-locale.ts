'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { DashboardLocale } from '@/shared/i18n/dashboard-locale.type';
import { dashboardLocaleCookie } from '@/shared/i18n/dashboard-locales.const';
import { directionForLocale, isDashboardLocale } from '@/shared/i18n/locale.util';

function readLocale(): DashboardLocale {
  if (typeof document === 'undefined') {
    return 'en';
  }
  const cookie = document.cookie
    .split('; ')
    .find((value) => value.startsWith(`${dashboardLocaleCookie}=`));
  const locale = cookie?.split('=')[1];

  return isDashboardLocale(locale) ? locale : 'en';
}

export function useDashboardLocale(): { locale: DashboardLocale; toggleLocale: () => void } {
  const router = useRouter();
  const [locale, setLocale] = useState<DashboardLocale>(readLocale);
  const toggleLocale = useCallback(() => {
    const nextLocale: DashboardLocale = locale === 'en' ? 'ar' : 'en';
    document.cookie = `${dashboardLocaleCookie}=${nextLocale}; Path=/; SameSite=Lax; Max-Age=31536000`;
    document.documentElement.lang = nextLocale;
    document.documentElement.dir = directionForLocale(nextLocale);
    setLocale(nextLocale);
    router.refresh();
  }, [locale, router]);

  return { locale, toggleLocale };
}

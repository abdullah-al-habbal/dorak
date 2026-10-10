import type { DashboardLocale } from './dashboard-locale.type';

export function isDashboardLocale(value: string | undefined): value is DashboardLocale {
  return value === 'en' || value === 'ar';
}

export function directionForLocale(locale: DashboardLocale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

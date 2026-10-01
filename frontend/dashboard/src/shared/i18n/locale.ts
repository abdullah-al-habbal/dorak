export const dashboardLocales = ['en', 'ar'] as const;

export type DashboardLocale = (typeof dashboardLocales)[number];

export const dashboardLocaleCookie = 'dorak_dashboard_locale';

export function isDashboardLocale(value: string | undefined): value is DashboardLocale {
  return value === 'en' || value === 'ar';
}

export function directionForLocale(locale: DashboardLocale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

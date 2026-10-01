import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import './globals.css';
import { DashboardProviders } from '@/providers';
import { dashboardLocaleCookie, directionForLocale, isDashboardLocale } from '@/shared/i18n/locale';

export const metadata: Metadata = { title: 'Dorak Dashboard' };
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const localeCookie = (await cookies()).get(dashboardLocaleCookie)?.value;
  const locale = isDashboardLocale(localeCookie) ? localeCookie : 'en';

  return (
    <html dir={directionForLocale(locale)} lang={locale} suppressHydrationWarning>
      <body>
        <DashboardProviders>{children}</DashboardProviders>
      </body>
    </html>
  );
}

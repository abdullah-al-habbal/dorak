import type { Metadata } from 'next';
import './globals.css';
import { DashboardProviders } from '@/providers/dashboard-providers';

export const metadata: Metadata = { title: 'Dorak Dashboard' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><DashboardProviders>{children}</DashboardProviders></body></html>;
}

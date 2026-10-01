import { notFound } from 'next/navigation';
import { DashboardShell } from '@/shared/components/layout/dashboard-shell';

export default async function DashboardAreaLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ area: string }> }>) {
  const { area } = await params;
  if (area === 'admin') {
    return <DashboardShell role="platform_admin">{children}</DashboardShell>;
  }
  if (area === 'manager') {
    return <DashboardShell role="branch_manager">{children}</DashboardShell>;
  }
  notFound();
}

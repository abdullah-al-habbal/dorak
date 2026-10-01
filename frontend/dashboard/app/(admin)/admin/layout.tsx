import { DashboardShell } from '@/shared/components/layout/dashboard-shell';

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <DashboardShell role="platform_admin">{children}</DashboardShell>;
}

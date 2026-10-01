import { DashboardShell } from '@/shared/components/layout/dashboard-shell';

export default function ManagerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <DashboardShell role="branch_manager">{children}</DashboardShell>;
}

import type { DashboardRole } from '@/shared/types/auth/dashboard-role';

export interface SidebarProps {
  className?: string;
  role: DashboardRole;
}

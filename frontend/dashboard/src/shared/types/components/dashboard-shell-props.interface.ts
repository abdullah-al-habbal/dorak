import type { ReactNode } from 'react';
import type { DashboardRole } from '@/shared/types/auth/dashboard-role';

export interface DashboardShellProps {
  children: ReactNode;
  role: DashboardRole;
}

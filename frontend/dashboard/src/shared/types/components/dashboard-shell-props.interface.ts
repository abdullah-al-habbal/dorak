import type { ReactNode } from 'react';
import type { DashboardRole } from '@/shared/types/auth';

export interface DashboardShellProps {
  children: ReactNode;
  role: DashboardRole;
}

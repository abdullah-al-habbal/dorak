import type { ReactNode } from 'react';
import type { DashboardClaim } from '@/shared/auth';

export interface DashboardShellProps {
  children: ReactNode;
  claim: DashboardClaim;
}

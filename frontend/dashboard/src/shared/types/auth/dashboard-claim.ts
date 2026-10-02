import type { DashboardRole } from './dashboard-role';

export interface DashboardClaim {
  subject: string;
  actorType: 'admin' | 'branch';
  role: DashboardRole;
  branchId?: string | undefined;
}

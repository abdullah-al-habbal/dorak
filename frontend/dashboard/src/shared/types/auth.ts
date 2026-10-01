export type DashboardRole = 'platform_admin' | 'branch_manager';

export interface DashboardClaim {
  subject: string;
  actorType: 'admin' | 'branch';
  role: DashboardRole;
  branchId?: string;
}

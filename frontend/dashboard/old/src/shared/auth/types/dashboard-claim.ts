import type { DashboardRole } from '@/shared/auth/enums/dashboard-roles';
import type { DashboardActorType } from './dashboard-actor-type';

export interface DashboardClaim {
  subject: string;
  actorType: DashboardActorType;
  role: DashboardRole;
  branchId?: string | undefined;
}

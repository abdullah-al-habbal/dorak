export type DashboardActorType = 'admin' | 'branch';

export function isDashboardActorType(value: unknown): value is DashboardActorType {
  return value === 'admin' || value === 'branch';
}

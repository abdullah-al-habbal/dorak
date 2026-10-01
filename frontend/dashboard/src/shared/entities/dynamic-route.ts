import { notFound } from 'next/navigation';
import type { DashboardArea } from '@/shared/routes/dashboard-routes';
import { getEntityConfig } from './configs';

export function resolveDynamicEntity(
  area: string,
  entity: string,
): {
  readonly area: DashboardArea;
  readonly config: NonNullable<ReturnType<typeof getEntityConfig>>;
} {
  const config = getEntityConfig(entity);
  if ((area !== 'admin' && area !== 'manager') || !config?.access.areas.includes(area)) {
    notFound();
  }
  return { area, config };
}

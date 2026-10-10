import { notFound } from 'next/navigation';
import { type DashboardArea, isDashboardArea } from '@/shared/auth';
import { canPerformOperation } from '@/shared/entities/entity-access';
import type { EntityOperation } from '@/shared/entities/types/entity-operation';
import { getEntityConfig, type RegisteredEntityConfig } from './configs';

export function resolveDynamicEntity(
  area: string,
  entity: string,
  operation: EntityOperation,
): {
  readonly area: DashboardArea;
  readonly config: RegisteredEntityConfig;
} {
  const config = getEntityConfig(entity);
  if (
    !isDashboardArea(area) ||
    config === undefined ||
    !canPerformOperation(config.access, operation, area)
  ) {
    notFound();
  }

  return { area, config };
}

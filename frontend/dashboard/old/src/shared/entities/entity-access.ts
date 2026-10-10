import type { DashboardArea } from '@/shared/auth';
import type { EntityAccess } from '@/shared/entities/types/entity-access';
import type { EntityOperation } from '@/shared/entities/types/entity-operation';

export function canPerformOperation(
  access: EntityAccess,
  operation: EntityOperation,
  area: DashboardArea,
): boolean {
  return access[operation]?.areas.includes(area) === true;
}

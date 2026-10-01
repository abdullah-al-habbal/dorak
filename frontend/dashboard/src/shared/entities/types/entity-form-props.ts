import type { EntityFieldTree } from '@/shared/entities/fields';
import type { DashboardArea } from '@/shared/routes/dashboard-routes';
import type { ServerListParams } from '@/shared/types/query';
import type { EntityConfig, EntityRecord } from './entity-config';
import type { EntityId } from './entity-id';

export type EntityFormProps<
  TEntity extends EntityRecord,
  TInput,
  TFields extends EntityFieldTree,
> = {
  readonly area: DashboardArea;
  readonly config: EntityConfig<TEntity, TInput, TFields, ServerListParams>;
  readonly id?: EntityId;
};

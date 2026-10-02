import type { EntityFieldTree } from '@/shared/entities/fields';
import type { DashboardArea } from '@/shared/routes/dashboard-routes';
import type { ServerListParams } from '@/shared/types/query/server-list-params-wire';
import type { EntityConfig } from './entity-config';
import type { EntityId } from './entity-id';
import type { EntityRecord } from './entity-record';

export type EntityFormProps<
  TEntity extends EntityRecord,
  TInput,
  TFields extends EntityFieldTree,
> = {
  readonly area: DashboardArea;
  readonly config: EntityConfig<TEntity, TInput, TFields, ServerListParams>;
  readonly id?: EntityId;
};

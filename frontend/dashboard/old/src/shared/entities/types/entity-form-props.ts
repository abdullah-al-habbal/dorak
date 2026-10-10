import type { DashboardArea, DashboardClaim } from '@/shared/auth';
import type { EntityFieldTree } from '@/shared/entities/fields';
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
  readonly claim: DashboardClaim;
  readonly config: EntityConfig<TEntity, TInput, TFields, ServerListParams>;
  readonly id?: EntityId;
};

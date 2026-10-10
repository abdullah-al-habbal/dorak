import type { FieldValues } from 'react-hook-form';
import type { EntityFieldTree } from '@/shared/entities/fields';
import type { EntityConfig } from '@/shared/entities/types/entity-config';
import type { EntityRecord } from '@/shared/entities/types/entity-record';
import type { ServerListParams } from '@/shared/types/query/server-list-params-wire';

export type RegisteredEntityConfig = EntityConfig<
  EntityRecord,
  FieldValues,
  EntityFieldTree,
  ServerListParams
>;

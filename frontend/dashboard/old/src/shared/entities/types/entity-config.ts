import type { ComponentType } from 'react';
import type { z } from 'zod';
import type { DashboardArea, DashboardClaim } from '@/shared/auth';
import type { EntityFieldTree, InferFieldTree } from '@/shared/entities/fields';
import type { DashboardMessageKey } from '@/shared/i18n/messages';
import type { ServerListParams } from '@/shared/types/query/server-list-params-wire';
import type { EntityAccess } from './entity-access';
import type { EntityApiConfig } from './entity-api-config';
import type { EntityColumn } from './entity-column';
import type { EntityDetail } from './entity-detail';
import type { EntityFieldRenderer } from './entity-field-renderer';
import type { EntityFilter } from './entity-filter';
import type { EntityId } from './entity-id';
import type { EntityRecord } from './entity-record';

export type EntityConfig<
  TEntity extends EntityRecord,
  TInput,
  TFields extends EntityFieldTree,
  TParams extends object = ServerListParams,
> = {
  readonly slug: string;
  readonly entity: { readonly plural: string; readonly singular: string };
  readonly api: EntityApiConfig;
  readonly access: EntityAccess;
  readonly messages: {
    readonly created: DashboardMessageKey;
    readonly deleted: DashboardMessageKey;
    readonly description: DashboardMessageKey;
    readonly empty: DashboardMessageKey;
    readonly plural: DashboardMessageKey;
    readonly singular: DashboardMessageKey;
    readonly updated: DashboardMessageKey;
  };
  readonly fields: TFields;
  readonly ui: {
    readonly list: {
      readonly columns: readonly EntityColumn<TEntity>[];
      readonly filters?: readonly EntityFilter[];
      readonly rowActions?: ComponentType<{
        readonly area: DashboardArea;
        readonly entity: TEntity;
      }>;
      readonly search?: boolean;
    };
    readonly show: {
      readonly fields: readonly EntityDetail<TEntity>[];
      /** Omitted when the entity has no natural per-record name; the singular
       *  message label is used as the heading instead. */
      readonly title?: (entity: TEntity) => string;
    };
  };
  readonly overrides?: {
    readonly fromApi?: (response: unknown) => TEntity;
    readonly toCreatePayload?: (input: TInput) => unknown;
    readonly toUpdatePayload?: (input: TInput) => unknown;
    readonly endpoint?: {
      readonly create?: () => string;
      readonly delete?: (id: EntityId) => string;
      readonly get?: (id: EntityId) => string;
      readonly list?: (params: TParams) => string;
      readonly update?: (id: EntityId) => string;
    };
    readonly onMutationError?: (error: Error, t: (key: DashboardMessageKey) => string) => void;
    readonly renderForm?: ComponentType<{
      readonly area: DashboardArea;
      readonly claim: DashboardClaim;
      readonly id?: EntityId;
    }>;
    readonly renderList?: ComponentType<{ readonly area: DashboardArea }>;
    readonly renderShow?: ComponentType<{ readonly area: DashboardArea; readonly id: EntityId }>;
    readonly renderField?: Readonly<Record<string, EntityFieldRenderer>>;
    readonly schema?: {
      readonly create?: z.ZodTypeAny;
      readonly update?: z.ZodTypeAny;
    };
    readonly toListParams?: (params: TParams) => Record<string, unknown>;
  };
};

/**
 * `TInput` defaults to the input derived from `TFields`. An entity whose update
 * payload is not its field tree — a status transition, for example — passes it
 * explicitly so `toUpdatePayload` stays typed instead of widening to `unknown`.
 */
export function defineEntityConfig<
  TEntity extends EntityRecord,
  TFields extends EntityFieldTree,
  TParams extends object = ServerListParams,
  TInput = InferFieldTree<TFields>,
>(
  config: EntityConfig<TEntity, TInput, TFields, TParams>,
): EntityConfig<TEntity, TInput, TFields, TParams> {
  return config;
}

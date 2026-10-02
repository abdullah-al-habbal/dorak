import type { ComponentType } from 'react';
import type { z } from 'zod';
import type { EntityFieldTree, InferFieldTree } from '@/shared/entities/fields';
import type { DashboardArea } from '@/shared/routes/dashboard-routes';
import type { ServerListParams } from '@/shared/types/query';
import type { EntityApiConfig } from './entity-api-config';
import type { EntityColumn } from './entity-column';
import type { EntityDetail } from './entity-detail';
import type { EntityFieldRenderer } from './entity-field-renderer';
import type { EntityFilter } from './entity-filter';
import type { EntityId } from './entity-id';

export interface EntityRecord {
  readonly id: EntityId;
}

export type EntityConfig<
  TEntity extends EntityRecord,
  TInput,
  TFields extends EntityFieldTree,
  TParams extends object = ServerListParams,
> = {
  readonly slug: string;
  readonly entity: { readonly plural: string; readonly singular: string };
  readonly api: EntityApiConfig<TParams>;
  readonly access: { readonly areas: readonly DashboardArea[] };
  readonly messages: {
    readonly created: string;
    readonly deleted: string;
    readonly description: string;
    readonly empty: string;
    readonly plural: string;
    readonly singular: string;
    readonly updated: string;
  };
  readonly fields: TFields;
  readonly ui: {
    readonly form?: { readonly create?: boolean; readonly edit?: boolean };
    readonly list: {
      readonly columns: readonly EntityColumn<TEntity>[];
      readonly filters?: readonly EntityFilter[];
      readonly search?: boolean;
    };
    readonly show: {
      readonly fields: readonly EntityDetail<TEntity>[];
      readonly title: (entity: TEntity) => string;
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
    readonly onMutationError?: (error: Error) => void;
    readonly renderForm?: ComponentType<{ readonly area: DashboardArea; readonly id?: EntityId }>;
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

export function defineEntityConfig<
  TEntity extends EntityRecord,
  TFields extends EntityFieldTree,
  TParams extends object = ServerListParams,
>(
  config: EntityConfig<TEntity, InferFieldTree<TFields>, TFields, TParams>,
): EntityConfig<TEntity, InferFieldTree<TFields>, TFields, TParams> {
  return config;
}

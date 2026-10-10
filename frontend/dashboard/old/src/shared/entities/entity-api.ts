import { fetchEntityAt, fetchPaginatedList, mutateEntity } from '@/shared/api';
import type { EntityFieldTree } from '@/shared/entities/fields';
import type { EntityConfig } from '@/shared/entities/types/entity-config';
import type { EntityId } from '@/shared/entities/types/entity-id';
import type { EntityRecord } from '@/shared/entities/types/entity-record';
import type { DashboardPage } from '@/shared/types/pagination/dashboard-page';

export function createEntityApi<
  TEntity extends EntityRecord,
  TInput,
  TFields extends EntityFieldTree,
  TParams extends object,
>(config: EntityConfig<TEntity, TInput, TFields, TParams>) {
  const url = {
    create: () => config.overrides?.endpoint?.create?.() ?? config.api.collection,
    delete: (id: EntityId) =>
      config.overrides?.endpoint?.delete?.(id) ?? `${config.api.collection}/${id}`,
    get: (id: EntityId) =>
      config.overrides?.endpoint?.get?.(id) ?? `${config.api.collection}/${id}`,
    list: (params: TParams) => config.overrides?.endpoint?.list?.(params) ?? config.api.collection,
    update: (id: EntityId) =>
      config.overrides?.endpoint?.update?.(id) ?? `${config.api.collection}/${id}`,
  };
  const fromApi = (response: unknown): TEntity =>
    config.overrides?.fromApi?.(response) ?? (response as TEntity);

  return {
    async list(params: TParams): Promise<DashboardPage<TEntity>> {
      const listParams = config.overrides?.toListParams?.(params) ?? params;
      const page = await fetchPaginatedList<unknown, object>(url.list(params), listParams);
      return { ...page, items: page.items.map(fromApi) };
    },
    async get(id: EntityId): Promise<TEntity> {
      return fromApi(await fetchEntityAt<unknown>(url.get(id)));
    },
    async create(input: TInput): Promise<TEntity> {
      return fromApi(
        await mutateEntity<unknown, unknown>(
          url.create(),
          config.api.methods?.create ?? 'POST',
          config.overrides?.toCreatePayload?.(input) ?? input,
        ),
      );
    },
    async update(id: EntityId, input: TInput): Promise<TEntity> {
      return fromApi(
        await mutateEntity<unknown, unknown>(
          url.update(id),
          config.api.methods?.update ?? 'PATCH',
          config.overrides?.toUpdatePayload?.(input) ?? input,
        ),
      );
    },
    delete: (id: EntityId): Promise<void> => mutateEntity<never, void>(url.delete(id), 'DELETE'),
  };
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { useInvalidatingMutation } from '@/shared/hooks/use-invalidating-mutation';
import { createQueryKeys } from '@/shared/utils/query-keys';
import { createEntityApi } from './entity-api';
import type { EntityFieldTree } from './fields';
import type { EntityConfig, EntityRecord } from './types/entity-config';
import type { EntityId } from './types/entity-id';

export function createEntityHooks<
  TEntity extends EntityRecord,
  TInput,
  TFields extends EntityFieldTree,
  TParams extends object,
>(config: EntityConfig<TEntity, TInput, TFields, TParams>) {
  const api = createEntityApi(config);
  const queryKeys = createQueryKeys(['dashboard', config.slug]);

  return {
    queryKeys,
    useEntities: (params: TParams) =>
      useQuery({ queryKey: queryKeys.list(params), queryFn: () => api.list(params) }),
    useEntity: (id: EntityId) =>
      useQuery({
        enabled: id !== '',
        queryKey: queryKeys.detail(id),
        queryFn: () => api.get(id),
      }),
    useCreateEntity: () =>
      useInvalidatingMutation({ mutationFn: (input: TInput) => api.create(input) }, [
        queryKeys.all,
      ]),
    useUpdateEntity: () =>
      useInvalidatingMutation(
        { mutationFn: ({ id, input }: { id: EntityId; input: TInput }) => api.update(id, input) },
        [queryKeys.all],
      ),
    useDeleteEntity: () =>
      useInvalidatingMutation({ mutationFn: (id: EntityId) => api.delete(id) }, [queryKeys.all]),
  };
}

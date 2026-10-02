'use client';

import { useQuery } from '@tanstack/react-query';
import { useDashboardTranslation } from '@/shared/hooks/use-dashboard-translation';
import { useInvalidatingMutation } from '@/shared/hooks/use-invalidating-mutation';
import { createQueryKeys } from '@/shared/utils/query-keys';
import { createEntityApi } from './entity-api';
import type { EntityFieldTree } from './fields';
import type { EntityConfig } from './types/entity-config';
import type { EntityId } from './types/entity-id';
import type { EntityRecord } from './types/entity-record';

export function createEntityHooks<
  TEntity extends EntityRecord,
  TInput,
  TFields extends EntityFieldTree,
  TParams extends object,
>(config: EntityConfig<TEntity, TInput, TFields, TParams>) {
  const api = createEntityApi(config);
  const queryKeys = createQueryKeys(['dashboard', config.slug]);

  /**
   * `onMutationError` is a config declaration, so it cannot call a hook itself.
   * Resolving the translator here — inside each `use*` hook, where the rules of
   * hooks are satisfied — lets a config surface a localized message without the
   * engine knowing anything about i18n.
   */
  const useMutationError = () => {
    const { t } = useDashboardTranslation();
    const handler = config.overrides?.onMutationError;
    return handler === undefined
      ? undefined
      : (error: Error) => {
          handler(error, t);
        };
  };

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
    useCreateEntity: () => {
      const onError = useMutationError();
      return useInvalidatingMutation(
        {
          mutationFn: (input: TInput) => api.create(input),
          ...(onError === undefined ? {} : { onError }),
        },
        [queryKeys.all],
      );
    },
    useUpdateEntity: () => {
      const onError = useMutationError();
      return useInvalidatingMutation(
        {
          mutationFn: ({ id, input }: { id: EntityId; input: TInput }) => api.update(id, input),
          ...(onError === undefined ? {} : { onError }),
        },
        [queryKeys.all],
      );
    },
    useDeleteEntity: () => {
      const onError = useMutationError();
      return useInvalidatingMutation(
        {
          mutationFn: (id: EntityId) => api.delete(id),
          ...(onError === undefined ? {} : { onError }),
        },
        [queryKeys.all],
      );
    },
  };
}

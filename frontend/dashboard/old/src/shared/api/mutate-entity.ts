import { dashboardApi } from '@/shared/api/client';
import type { EntityMutationMethod } from '@/shared/api/types/entity-mutation-method';

export function mutateEntity<TInput = never, TResponse = unknown>(
  endpoint: string,
  method: EntityMutationMethod,
  payload?: TInput,
): Promise<TResponse> {
  return dashboardApi<TResponse>(
    endpoint,
    payload === undefined
      ? { method }
      : { body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' }, method },
  );
}

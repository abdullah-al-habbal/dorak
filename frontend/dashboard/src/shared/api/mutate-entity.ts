import { dashboardApi } from '@/shared/api/client';

type EntityMutationMethod = 'DELETE' | 'PATCH' | 'POST' | 'PUT';

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

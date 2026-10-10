export function createQueryKeys(scope: readonly [string, string]) {
  return {
    all: scope,
    detail: (id: string) => [...scope, id] as const,
    list: <TParams extends object>(params: TParams) => [...scope, params] as const,
  };
}

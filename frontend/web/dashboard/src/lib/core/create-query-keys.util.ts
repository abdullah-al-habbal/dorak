type KeySegments = readonly unknown[];
type KeyBuilder = (...args: never[]) => KeySegments;
type KeyDefinition = KeySegments | KeyBuilder;

type ScopedKey<
  TRoot extends string,
  TDefinition extends KeyDefinition,
> = TDefinition extends KeySegments
  ? readonly [TRoot, ...TDefinition]
  : TDefinition extends (...args: infer TArgs) => infer TSegments
    ? TSegments extends KeySegments
      ? (...args: TArgs) => readonly [TRoot, ...TSegments]
      : never
    : never;

export type QueryKeys<
  TRoot extends string,
  TDefinitions extends Record<string, KeyDefinition>,
> = {
  readonly all: readonly [TRoot];
} & {
  readonly [TName in keyof TDefinitions]: ScopedKey<TRoot, TDefinitions[TName]>;
};

/** Builds one key: the root segment followed by the given segments. */
export function queryKey<
  const TRoot extends string,
  const TSegments extends KeySegments,
>(root: TRoot, ...segments: TSegments): readonly [TRoot, ...TSegments] {
  return [root, ...segments];
}

/**
 * Builds a module's key factory. `all` is the root key; each definition is either
 * a fixed segment list or a builder, and both are prefixed with the root so that
 * invalidating `all` matches every key of the module.
 */
export function createQueryKeys<
  const TRoot extends string,
  const TDefinitions extends Record<string, KeyDefinition>,
>(root: TRoot, definitions: TDefinitions): QueryKeys<TRoot, TDefinitions> {
  const keys: Record<string, unknown> = { all: [root] as const };
  for (const [name, definition] of Object.entries(definitions)) {
    keys[name] =
      typeof definition === "function"
        ? (...args: never[]) => [root, ...definition(...args)]
        : [root, ...definition];
  }
  return keys as QueryKeys<TRoot, TDefinitions>;
}

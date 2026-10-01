export type EntityApiConfig<TParams extends object> = {
  readonly collection: `/${string}`;
  readonly defaultParams: TParams;
  readonly methods?: {
    readonly create?: 'POST' | 'PUT';
    readonly update?: 'PATCH' | 'PUT';
  };
};

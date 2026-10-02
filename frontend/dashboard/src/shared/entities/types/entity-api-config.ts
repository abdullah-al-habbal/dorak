export type EntityApiConfig = {
  readonly collection: `/${string}`;
  readonly methods?: {
    readonly create?: 'POST' | 'PUT';
    readonly update?: 'PATCH' | 'PUT';
  };
};

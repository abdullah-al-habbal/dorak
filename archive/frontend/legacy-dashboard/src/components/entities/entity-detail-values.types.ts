export interface IDetailValue {
  /** Dot path of the value inside the entity, for example `chair.label`. */
  path: string;
  /** Last path segment in snake_case or camelCase, used for the label lookup. */
  key: string;
  value: string;
}

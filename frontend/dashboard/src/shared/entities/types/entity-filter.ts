export type EntityFilter = {
  readonly key: string;
  readonly label: string;
  readonly options: readonly { readonly label: string; readonly value: string }[];
};

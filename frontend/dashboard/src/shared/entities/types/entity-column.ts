import type { ReactNode } from 'react';

export type EntityColumn<TEntity> = {
  readonly id: string;
  readonly label: string;
  readonly serverSortKey?: string;
  readonly value: (entity: TEntity) => ReactNode;
};

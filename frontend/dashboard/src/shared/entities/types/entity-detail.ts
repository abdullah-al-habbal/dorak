import type { ReactNode } from 'react';

export type EntityDetail<TEntity> = {
  readonly label: string;
  readonly value: (entity: TEntity) => ReactNode;
};

import type { ReactNode } from 'react';
import type { DashboardMessageKey } from '@/shared/i18n/messages';

export type EntityColumn<TEntity> = {
  readonly id: string;
  readonly label: DashboardMessageKey;
  readonly value: (entity: TEntity) => ReactNode;
};

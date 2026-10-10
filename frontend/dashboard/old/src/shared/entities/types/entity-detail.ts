import type { ReactNode } from 'react';
import type { DashboardMessageKey } from '@/shared/i18n/messages';

export type EntityDetail<TEntity> = {
  readonly label: DashboardMessageKey;
  readonly value: (entity: TEntity) => ReactNode;
};

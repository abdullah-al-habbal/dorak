import type { z } from 'zod';
import type { DashboardMessageKey } from '@/shared/i18n/messages';

export type BaseField<TSchema extends z.ZodTypeAny> = {
  readonly form?: boolean;
  readonly label: DashboardMessageKey;
  readonly list?: boolean;
  readonly readonly?: boolean;
  readonly schema: TSchema;
  readonly show?: boolean;
};

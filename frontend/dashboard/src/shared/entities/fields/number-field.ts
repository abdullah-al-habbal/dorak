import type { z } from 'zod';
import type { BaseField } from './base-field';

export type NumberField<TSchema extends z.ZodTypeAny = z.ZodTypeAny> = BaseField<TSchema> & {
  readonly control: 'number';
  readonly max?: number;
  readonly min?: number;
  readonly step?: number;
};

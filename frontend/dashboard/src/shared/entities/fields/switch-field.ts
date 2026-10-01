import type { z } from 'zod';
import type { BaseField } from './base-field';

export type SwitchField<TSchema extends z.ZodTypeAny = z.ZodTypeAny> = BaseField<TSchema> & {
  readonly control: 'switch';
};

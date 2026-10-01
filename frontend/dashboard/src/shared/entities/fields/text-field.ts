import type { z } from 'zod';
import type { BaseField } from './base-field';

export type TextField<TSchema extends z.ZodTypeAny = z.ZodTypeAny> = BaseField<TSchema> & {
  readonly control: 'email' | 'text' | 'textarea' | 'uuid';
  readonly placeholder?: string;
};

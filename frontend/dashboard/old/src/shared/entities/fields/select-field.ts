import type { z } from 'zod';
import type { BaseField } from './base-field';

export type SelectField<
  TValue extends string,
  TSchema extends z.ZodTypeAny,
> = BaseField<TSchema> & {
  readonly control: 'select';
  readonly options: readonly { readonly label: string; readonly value: TValue }[];
};

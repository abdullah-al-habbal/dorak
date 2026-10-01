import type { z } from 'zod';

export type BaseField<TSchema extends z.ZodTypeAny> = {
  readonly form?: boolean;
  readonly label: string;
  readonly list?: boolean;
  readonly readonly?: boolean;
  readonly schema: TSchema;
  readonly show?: boolean;
};

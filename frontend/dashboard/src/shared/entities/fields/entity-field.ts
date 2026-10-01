import type { z } from 'zod';
import type { GroupField } from './group-field';
import type { NumberField } from './number-field';
import type { SelectField } from './select-field';
import type { SwitchField } from './switch-field';
import type { TextField } from './text-field';

export interface EntityFieldTree {
  readonly [field: string]: EntityField;
}

export type EntityField =
  | TextField
  | NumberField
  | SwitchField
  | SelectField<string, z.ZodTypeAny>
  | GroupField<EntityFieldTree>;

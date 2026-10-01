import type { Control, UseFormRegisterReturn } from 'react-hook-form';
import type { EntityField } from '@/shared/entities/fields';

export type EntityFieldInputProps = {
  readonly control: Control;
  readonly field: Exclude<EntityField, { readonly control: 'group' }>;
  readonly name: string;
  readonly register: (name: string) => UseFormRegisterReturn;
};

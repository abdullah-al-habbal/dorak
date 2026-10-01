import type { Control, FieldValues, FormState, UseFormRegisterReturn } from 'react-hook-form';
import type { EntityFieldTree } from '@/shared/entities/fields';
import type { EntityFieldRenderer } from './entity-field-renderer';

export type EntityFieldsProps = {
  readonly control: Control;
  readonly fields: EntityFieldTree;
  readonly formState: FormState<FieldValues>;
  readonly prefix?: string;
  readonly register: (name: string) => UseFormRegisterReturn;
  readonly renderField?: Readonly<Record<string, EntityFieldRenderer>> | undefined;
};

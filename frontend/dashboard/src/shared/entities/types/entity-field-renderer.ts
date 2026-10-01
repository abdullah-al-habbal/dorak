import type { ReactNode } from 'react';
import type { Control, FieldValues, FormState, UseFormRegisterReturn } from 'react-hook-form';
import type { EntityField } from '@/shared/entities/fields';

export type EntityFieldRendererProps = {
  readonly control: Control;
  readonly field: EntityField;
  readonly formState: FormState<FieldValues>;
  readonly name: string;
  readonly register: (name: string) => UseFormRegisterReturn;
};

export type EntityFieldRenderer = (props: EntityFieldRendererProps) => ReactNode;

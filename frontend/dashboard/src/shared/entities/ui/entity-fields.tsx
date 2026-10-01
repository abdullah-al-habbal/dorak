'use client';

import { createElement } from 'react';
import type { EntityField } from '@/shared/entities/fields';
import type { EntityFieldsProps } from '@/shared/entities/types/entity-fields-props';
import { EntityFieldInput } from './entity-field-input';

export function EntityFields({
  control,
  fields,
  formState,
  prefix = '',
  register,
  renderField,
}: Readonly<EntityFieldsProps>) {
  return Object.entries<EntityField>(fields).map(([key, field]) => {
    const name = prefix === '' ? key : `${prefix}.${key}`;
    if (field.control === 'group') {
      return (
        <EntityFields
          control={control}
          fields={field.fields}
          formState={formState}
          key={name}
          prefix={name}
          register={register}
          renderField={renderField}
        />
      );
    }
    const render = renderField?.[name];
    if (render !== undefined) {
      return createElement(render, { control, field, formState, key: name, name, register });
    }
    return (
      <EntityFieldInput
        control={control}
        field={field}
        key={name}
        name={name}
        register={register}
      />
    );
  });
}

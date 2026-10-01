'use client';

import { Controller } from 'react-hook-form';
import { Input } from '@/shared/components/forms/input';
import type { EntityFieldInputProps } from '@/shared/entities/types/entity-field-input-props';
import { useDashboardTranslation } from '@/shared/hooks/use-dashboard-translation';

export function EntityFieldInput({
  control,
  field,
  name,
  register,
}: Readonly<EntityFieldInputProps>) {
  const { t } = useDashboardTranslation();
  const label = t(field.label as never);
  if (field.control === 'select') {
    return (
      <label className="grid gap-1 text-sm">
        <span>{label}</span>
        <select className="rounded-lg border bg-surface px-3 py-2" {...register(name)}>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.label as never)}
            </option>
          ))}
        </select>
      </label>
    );
  }
  if (field.control === 'switch') {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field: switchField }) => {
          const checked: boolean = switchField.value === true;
          return (
            <label className="flex items-center gap-2 text-sm">
              <Input
                checked={checked}
                onBlur={switchField.onBlur}
                onChange={(event) => {
                  switchField.onChange(event.target.checked);
                }}
                type="checkbox"
              />
              <span>{label}</span>
            </label>
          );
        }}
      />
    );
  }
  return (
    <label className="grid gap-1 text-sm">
      <span>{label}</span>
      <Input
        max={field.control === 'number' ? field.max : undefined}
        min={field.control === 'number' ? field.min : undefined}
        placeholder={field.control === 'number' ? undefined : field.placeholder}
        step={field.control === 'number' ? field.step : undefined}
        type={field.control === 'number' ? 'number' : field.control === 'email' ? 'email' : 'text'}
        {...register(name)}
      />
    </label>
  );
}

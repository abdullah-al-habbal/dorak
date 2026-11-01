"use client";

import { fieldLabelKey } from "@/components/entities/entity-form-field.util";
import { Checkbox } from "@/components/tailgrids/core/checkbox";
import { Input } from "@/components/tailgrids/core/input";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import type { IEntityCrudFormFieldProps } from "@/components/entities/entity-crud-form-field.types";
import { Controller, useWatch } from "react-hook-form";

/** One labeled input/select/checkbox row of the entity CRUD form. */
export function EntityCrudFormField({
  field,
  fieldCopy,
  options,
  form,
}: IEntityCrudFormFieldProps) {
  const fieldValue = useWatch({ control: form.control, name: field as never });
  const fieldLabel =
    fieldCopy[fieldLabelKey(field) as keyof typeof fieldCopy] ?? field;
  if (field === "isAtHome")
    return (
      <div className="grid gap-2 text-sm text-text-100">
        <Controller
          control={form.control}
          name="isAtHome"
          render={({ field: atHomeField }) => (
            <Checkbox
              isSelected={atHomeField.value === true}
              onChange={atHomeField.onChange}
            >
              {fieldLabel}
            </Checkbox>
          )}
        />
      </div>
    );
  return (
    <label className="grid gap-2 text-sm text-text-100">
      <span>{fieldLabel}</span>
      {options ? (
        <Select
          value={String(fieldValue ?? "")}
          onChange={(value) => {
            const nextValue = String(value);
            form.setValue(
              field as never,
              (nextValue === "" ? null : nextValue) as never,
            );
          }}
        >
          <SelectTrigger>
            <SelectValue />
            <SelectIndicator />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem
                id={option[0]}
                key={option[0]}
                isDisabled={option[2] === true}
              >
                {option[1]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          {...form.register(field as never, {
            setValueAs: (value) => (value === "" ? null : value),
          })}
          state={form.formState.errors[field as never] ? "error" : "default"}
        />
      )}
      {field === "barberId" && form.formState.errors.barberId?.message ? (
        <span className="text-input-error-focus-border" role="alert">
          {String(form.formState.errors.barberId.message)}
        </span>
      ) : null}
    </label>
  );
}

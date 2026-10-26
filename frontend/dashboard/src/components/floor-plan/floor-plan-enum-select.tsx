"use client";

import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

interface IFloorPlanEnumSelectProps<TForm extends FieldValues> {
  control: Control<TForm>;
  name: Path<TForm>;
  label: string;
  options: ReadonlyArray<readonly [value: string, label: string]>;
}

export function FloorPlanEnumSelect<TForm extends FieldValues>({
  control,
  name,
  label,
  options,
}: IFloorPlanEnumSelectProps<TForm>) {
  return (
    <label className="grid gap-2 text-sm text-text-100">
      <span>{label}</span>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            value={String(field.value ?? "")}
            onChange={(key) => field.onChange(String(key))}
          >
            <SelectTrigger>
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent>
              {options.map(([value, text]) => (
                <SelectItem id={value} key={value}>
                  {text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </label>
  );
}

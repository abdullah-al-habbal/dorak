"use client";

import type { JSX } from "react";

import { FormField } from "@/components/common/form-field";
import { Input } from "@/components/ui/input";

interface InspectorNumberFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export function InspectorNumberField({ id, label, value, onChange }: InspectorNumberFieldProps): JSX.Element {
  return (
    <FormField id={id} label={label}>
      <Input id={id} type="number" inputMode="decimal" dir="ltr" value={Math.round(value * 10) / 10} onChange={(event) => onChange(Number(event.target.value))} />
    </FormField>
  );
}

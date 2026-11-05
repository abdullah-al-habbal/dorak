import type { JSX, ReactNode } from "react";

import { Label } from "@/components/ui/label";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function fieldErrorId(id: string): string {
  return `${id}-error`;
}

/** Label above, control, inline error below. The control sets aria-describedby to `fieldErrorId(id)`. */
export function FormField({ id, label, error, hint, children }: FormFieldProps): JSX.Element {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>
        {label}
        {hint ? <span className="font-normal text-muted-foreground">({hint})</span> : null}
      </Label>
      {children}
      {error ? (
        <p id={fieldErrorId(id)} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

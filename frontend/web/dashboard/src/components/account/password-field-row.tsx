import type { JSX } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { PasswordInput } from "@/components/auth/forms/password-input";
import { FormField, fieldErrorId } from "@/components/common/form-field";

interface PasswordFieldRowProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  autoComplete: "current-password" | "new-password";
  registration: UseFormRegisterReturn;
}

export function PasswordFieldRow({ id, label, hint, error, autoComplete, registration }: PasswordFieldRowProps): JSX.Element {
  return (
    <FormField id={id} label={label} hint={hint} error={error}>
      <PasswordInput id={id} autoComplete={autoComplete} invalid={Boolean(error)} describedBy={error ? fieldErrorId(id) : undefined} registration={registration} />
    </FormField>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

import { useDictionary } from "@/hooks/core/use-dictionary";
import { useFeedbackMutation } from "@/hooks/core/use-feedback-mutation";
import { mapApiFormError } from "@/lib/core/map-api-form-error.util";
import { changePasswordFormSchema } from "@/schemas/account/change-password-form.zod";
import { changePassword } from "@/services/api/mutation/change-password.mutation";
import type { ChangePasswordFormValues } from "@/types/account/change-password-form-values.type";

const EMPTY: ChangePasswordFormValues = { current_password: "", password: "", password_confirmation: "" };
const FIELDS = new Set<string>(Object.keys(EMPTY));

function isFormField(name: string): name is keyof ChangePasswordFormValues {
  return FIELDS.has(name);
}

interface ChangePasswordForm {
  form: UseFormReturn<ChangePasswordFormValues>;
  onSubmit: () => Promise<void>;
  formError?: string;
  saving: boolean;
}

/** Changing the password signs every other session out; the BFF keeps this one by sending its refresh token. */
export function useChangePasswordForm(): ChangePasswordForm {
  const { account } = useDictionary();
  const p = account.password;
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema({ current: p.currentRequired, length: p.lengthInvalid, mismatch: p.mismatch })),
    defaultValues: EMPTY,
  });
  const mutation = useFeedbackMutation({ mutationFn: changePassword, invalidate: [], successMessage: () => p.changed });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync(values);
      form.reset(EMPTY);
    } catch (error) {
      const mapped = mapApiFormError(error, account.errors.generic);
      for (const [name, message] of Object.entries(mapped.fieldErrors)) {
        if (isFormField(name)) form.setError(name, { message });
      }
      if (mapped.formError) form.setError("root", { message: mapped.formError });
    }
  });

  return { form, onSubmit, formError: form.formState.errors.root?.message, saving: mutation.isPending };
}

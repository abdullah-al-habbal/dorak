"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

import { useDictionary } from "@/hooks/core/use-dictionary";
import { useFeedbackMutation } from "@/hooks/core/use-feedback-mutation";
import { accountKeys } from "@/lib/query-keys/account/account-keys";
import { mapApiFormError } from "@/lib/core/map-api-form-error.util";
import { displayNameFormSchema } from "@/schemas/display-name-form.zod";
import { updateDisplayName } from "@/services/api/mutation/account.mutation";
import { useAuthStore } from "@/store/auth.store";
import type { DisplayNameFormValues } from "@/types/account/display-name-form-values.type";

interface DisplayNameForm {
  form: UseFormReturn<DisplayNameFormValues>;
  onSubmit: () => Promise<void>;
  formError?: string;
  saving: boolean;
}

export function useDisplayNameForm(current: string | null): DisplayNameForm {
  const { account } = useDictionary();
  const patchProfile = useAuthStore((state) => state.patchProfile);
  const form = useForm<DisplayNameFormValues>({
    resolver: zodResolver(displayNameFormSchema(account.profile.nameInvalid)),
    values: { display_name: current ?? "" },
  });
  const mutation = useFeedbackMutation({ mutationFn: updateDisplayName, invalidate: [accountKeys.profile], successMessage: () => account.profile.saved });

  const onSubmit = form.handleSubmit(async ({ display_name }) => {
    try {
      const profile = await mutation.mutateAsync(display_name);
      patchProfile({ display_name: profile.display_name });
    } catch (error) {
      const mapped = mapApiFormError(error, account.errors.generic);
      if (mapped.fieldErrors.display_name) form.setError("display_name", { message: mapped.fieldErrors.display_name });
      if (mapped.formError) form.setError("root", { message: mapped.formError });
    }
  });

  return { form, onSubmit, formError: form.formState.errors.root?.message, saving: mutation.isPending };
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

import { resetDoneLoginRoute } from "@/config/routes.constant";
import type { AuthActor } from "@/enums/auth-actor.enum";
import { useDictionary } from "@/hooks/core/use-dictionary";
import { mapApiFormError } from "@/lib/map-api-form-error.util";
import { isInvalidResetLink, isTooManyRequests } from "@/lib/password-reset-error.util";
import { passwordPairSchema } from "@/schemas/fields/password-pair.zod";
import { resetPassword } from "@/services/api/mutation/reset-password.mutation";
import type { PasswordPairValues } from "@/types/account/password-pair-values.type";

interface ResetLink {
  actor: AuthActor;
  email: string;
  token: string;
}

interface ResetPasswordForm {
  form: UseFormReturn<PasswordPairValues>;
  onSubmit: () => Promise<void>;
  /** True once the backend rejected the link itself; the form gives way to "ask for a new link". */
  linkInvalid: boolean;
  formError: string | null;
  submitting: boolean;
}

export function useResetPasswordForm({ actor, email, token }: ResetLink): ResetPasswordForm {
  const { auth, passwordReset } = useDictionary();
  const router = useRouter();
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<PasswordPairValues>({
    resolver: zodResolver(passwordPairSchema({ length: passwordReset.validation.passwordLength, mismatch: passwordReset.validation.passwordMismatch })),
    defaultValues: { password: "", password_confirmation: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await resetPassword({ actor, email, token, ...values });
      router.replace(resetDoneLoginRoute(actor));
    } catch (error) {
      if (isInvalidResetLink(error)) return setLinkInvalid(true);
      if (isTooManyRequests(error)) return setFormError(passwordReset.tooManyRequests);
      const mapped = mapApiFormError(error, auth.server);
      for (const [name, message] of Object.entries(mapped.fieldErrors)) {
        if (name === "password" || name === "password_confirmation") form.setError(name, { message });
      }
      setFormError(mapped.formError ?? null);
    }
  });

  return { form, onSubmit, linkInvalid, formError, submitting: form.formState.isSubmitting };
}

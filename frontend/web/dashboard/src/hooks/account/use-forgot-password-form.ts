"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

import type { AuthActor } from "@/enums/auth-actor.enum";
import { useDictionary } from "@/hooks/core/use-dictionary";
import { isTooManyRequests } from "@/lib/account/password-reset-error.util";
import { forgotPasswordFormSchema } from "@/schemas/account/forgot-password-form.zod";
import { requestPasswordReset } from "@/services/api/mutation/request-password-reset.mutation";
import type { ForgotPasswordFormValues } from "@/types/account/forgot-password-form-values.type";

interface ForgotPasswordForm {
  form: UseFormReturn<ForgotPasswordFormValues>;
  onSubmit: () => Promise<void>;
  /** The address the link was requested for; null until the request is accepted. */
  sentTo: string | null;
  formError: string | null;
  submitting: boolean;
  startOver: () => void;
}

export function useForgotPasswordForm(actor: AuthActor): ForgotPasswordForm {
  const { auth, passwordReset } = useDictionary();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema(passwordReset.validation.email)),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async ({ email }) => {
    setFormError(null);
    try {
      await requestPasswordReset({ actor, email });
      setSentTo(email.trim());
    } catch (error) {
      setFormError(isTooManyRequests(error) ? passwordReset.tooManyRequests : auth.server);
    }
  });

  const startOver = (): void => {
    setSentTo(null);
    form.reset({ email: "" });
  };

  return { form, onSubmit, sentTo, formError, submitting: form.formState.isSubmitting, startOver };
}

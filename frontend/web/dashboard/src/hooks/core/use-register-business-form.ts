"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

import { useDictionary } from "@/hooks/core/use-dictionary";
import { registerBusinessBody } from "@/lib/account/register-business.util";
import { registerErrorMessage } from "@/lib/account/register-error.util";
import { registerBusinessFormSchema } from "@/schemas/account/register-business-form.zod";
import { registerBusiness } from "@/services/api/mutation/register-business.mutation";
import type { RegisterBusinessFormValues } from "@/types/core/register-business-form-values.type";

const EMPTY_VALUES: RegisterBusinessFormValues = {
  ownerName: "",
  email: "",
  phone: "",
  password: "",
  password_confirmation: "",
  brandNameEn: "",
  brandNameAr: "",
  currency: "",
  branchNameEn: "",
  branchNameAr: "",
};

interface RegisterBusinessForm {
  form: UseFormReturn<RegisterBusinessFormValues>;
  onSubmit: () => Promise<void>;
  formError: string | null;
  submitting: boolean;
}

/** `onSent` receives the email once the sign-up is accepted; the next step is the code. `honeypot` is the hidden field's value. */
export function useRegisterBusinessForm(honeypot: () => string, onSent: (email: string) => void): RegisterBusinessForm {
  const { registerBusiness: t, auth } = useDictionary();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<RegisterBusinessFormValues>({
    resolver: zodResolver(registerBusinessFormSchema({ ...t.validation, pair: { length: t.validation.passwordLength, mismatch: t.validation.passwordMismatch } })),
    defaultValues: EMPTY_VALUES,
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await registerBusiness(registerBusinessBody(values, honeypot()));
      onSent(values.email.trim());
    } catch (error) {
      setFormError(registerErrorMessage(error, t, auth.server));
    }
  });

  return { form, onSubmit, formError, submitting: form.formState.isSubmitting };
}

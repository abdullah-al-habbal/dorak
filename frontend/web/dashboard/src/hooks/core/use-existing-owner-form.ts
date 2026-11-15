"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

import { AuthActor } from "@/enums/auth-actor.enum";
import { statusRoute } from "@/config/routes.constant";
import { ApiErrorCode } from "@/enums/api-error-code.enum";
import { useDictionary } from "@/hooks/core/use-dictionary";
import { existingOwnerBody } from "@/lib/register-business.util";
import { registerErrorMessage } from "@/lib/register-error.util";
import { existingOwnerFormSchema } from "@/schemas/register-business-form.zod";
import { ApiClientError } from "@/services/api/core/api-client-error";
import { createBrandForExistingClient } from "@/services/api/mutation/register-business.mutation";
import type { ExistingOwnerFormValues } from "@/types/core/existing-owner-form-values.type";

const EMPTY_VALUES: ExistingOwnerFormValues = { email: "", password: "", brandNameEn: "", brandNameAr: "", currency: "", branchNameEn: "", branchNameAr: "" };

interface ExistingOwnerForm {
  form: UseFormReturn<ExistingOwnerFormValues>;
  onSubmit: () => Promise<void>;
  formError: string | null;
  submitting: boolean;
}

/** "I already have a Dorak account": the client signs in with their password and the business is created on the same account. */
export function useExistingOwnerForm(): ExistingOwnerForm {
  const { registerBusiness: t, auth } = useDictionary();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<ExistingOwnerFormValues>({
    resolver: zodResolver(existingOwnerFormSchema({ ...t.validation, pair: { length: t.validation.passwordLength, mismatch: t.validation.passwordMismatch } })),
    defaultValues: EMPTY_VALUES,
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await createBrandForExistingClient(existingOwnerBody(values));
      router.replace(statusRoute(AuthActor.Owner));
      router.refresh();
    } catch (error) {
      const invalid = error instanceof ApiClientError && error.code === ApiErrorCode.InvalidCredentials;
      setFormError(invalid ? t.existing.invalid : registerErrorMessage(error, t, auth.server));
    }
  });

  return { form, onSubmit, formError, submitting: form.formState.isSubmitting };
}

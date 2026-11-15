"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

import { statusRoute } from "@/config/routes.constant";
import { RESEND_COOLDOWN_SECONDS } from "@/config/register-business.constant";
import { AuthActor } from "@/enums/auth-actor.enum";
import { ApiErrorCode } from "@/enums/api-error-code.enum";
import { useDictionary } from "@/hooks/core/use-dictionary";
import { registerErrorMessage } from "@/lib/account/register-error.util";
import { verifyCodeFormSchema } from "@/schemas/register-business-form.zod";
import { ApiClientError } from "@/services/api/core/api-client-error";
import { resendOwnerCode, verifyOwnerCode } from "@/services/api/mutation/register-business.mutation";

interface VerifyCodeValues {
  code: string;
}

interface VerifyOwnerCodeForm {
  form: UseFormReturn<VerifyCodeValues>;
  onSubmit: () => Promise<void>;
  resend: () => Promise<void>;
  /** Seconds until the code can be asked for again; 0 when it can be asked for now. */
  cooldown: number;
  notice: string | null;
  formError: string | null;
  submitting: boolean;
}

export function useVerifyOwnerCodeForm(email: string): VerifyOwnerCodeForm {
  const { registerBusiness: t, auth } = useDictionary();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const form = useForm<VerifyCodeValues>({ resolver: zodResolver(verifyCodeFormSchema(t.validation.code)), defaultValues: { code: "" } });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const onSubmit = form.handleSubmit(async ({ code }) => {
    setFormError(null);
    setNotice(null);
    try {
      await verifyOwnerCode({ email, code });
      router.replace(statusRoute(AuthActor.Owner));
      router.refresh();
    } catch (error) {
      const wrongCode = error instanceof ApiClientError && error.code === ApiErrorCode.InvalidRequest;
      setFormError(wrongCode ? t.verify.invalid : registerErrorMessage(error, t, auth.server));
    }
  });

  const resend = async (): Promise<void> => {
    setFormError(null);
    try {
      await resendOwnerCode(email);
      setNotice(t.verify.resent);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      setFormError(registerErrorMessage(error, t, auth.server));
    }
  };

  return { form, onSubmit, resend, cooldown, notice, formError, submitting: form.formState.isSubmitting };
}

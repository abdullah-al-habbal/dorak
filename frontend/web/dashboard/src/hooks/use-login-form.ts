"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { portalRoot } from "@/config/routes.constant";
import type { AuthActor } from "@/enums/auth-actor.enum";
import { useDictionary } from "@/hooks/use-dictionary";
import { loginFormSchema } from "@/schemas/login-form.zod";
import { isSafeCallback } from "@/services/api/auth/route-policy.util";
import { ApiClientError } from "@/services/api/core/api-client-error";
import { loginMutation } from "@/services/api/mutation/login.mutation";
import type { LoginFormValues } from "@/types/login-form-values.type";

const ERROR_KEY: Record<string, "invalidCredentials" | "accountBanned" | "tooManyAttempts" | "network"> = {
  invalid_credentials: "invalidCredentials",
  account_banned: "accountBanned",
  too_many_requests: "tooManyAttempts",
  network_error: "network",
};

export function useLoginForm(actor: AuthActor, callbackUrl: string | undefined) {
  const { auth } = useDictionary();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await loginMutation({ actor, ...values });
      router.replace(isSafeCallback(callbackUrl, actor) ? callbackUrl : portalRoot(actor));
      router.refresh();
    } catch (error) {
      const key = error instanceof ApiClientError ? ERROR_KEY[error.code] : undefined;
      setFormError(auth[key ?? "server"]);
    }
  });

  return { form, onSubmit, formError, submitting: form.formState.isSubmitting };
}

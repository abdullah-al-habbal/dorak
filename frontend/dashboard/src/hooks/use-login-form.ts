"use client";

import { ROUTES } from "@/config/routes.constant";
import { useLoginMutation } from "@/hooks/use-login-mutation";
import { useReplaceAndRefresh } from "@/hooks/use-replace-and-refresh";
import { isSafeCallback } from "@/services/api/auth/route-policy.util";
import type { AuthActor } from "@/services/api/auth/auth.types";
import type { FormEvent } from "react";

interface UseLoginFormOptions {
  actor: AuthActor;
  callbackUrl?: string;
}

export function useLoginForm({ actor, callbackUrl }: UseLoginFormOptions) {
  const navigate = useReplaceAndRefresh();
  const login = useLoginMutation();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    login.mutate(
      {
        actor,
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      },
      {
        onSuccess: () =>
          navigate(
            isSafeCallback(callbackUrl, actor)
              ? callbackUrl
              : ROUTES.portal[actor].root,
          ),
      },
    );
  }

  return { isPending: login.isPending, isError: login.isError, submit };
}

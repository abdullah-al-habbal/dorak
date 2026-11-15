"use client";

import type { JSX } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { BackToSignIn } from "@/components/auth/back-to-sign-in";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import type { AuthActor } from "@/enums/auth-actor.enum";
import { useDictionary } from "@/hooks/core/use-dictionary";

export function ForgotPasswordScreen({ actor }: { actor: AuthActor }): JSX.Element {
  const { auth, passwordReset } = useDictionary();
  return (
    <AuthShell eyebrow={auth.actors[actor].name} title={passwordReset.forgot.title} description={passwordReset.forgot.body} footer={<BackToSignIn actor={actor} />}>
      <ForgotPasswordForm actor={actor} />
    </AuthShell>
  );
}

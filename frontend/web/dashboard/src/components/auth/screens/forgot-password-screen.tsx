"use client";

import type { JSX } from "react";

import { AuthShell } from "@/components/auth/screens/auth-shell";
import { BackToSignIn } from "@/components/auth/forms/back-to-sign-in";
import { ForgotPasswordForm } from "@/components/auth/forms/forgot-password-form";
import type { AuthActor } from "@/enums/access/auth-actor.enum";
import { useDictionary } from "@/hooks/core/state/use-dictionary";

export function ForgotPasswordScreen({ actor }: { actor: AuthActor }): JSX.Element {
  const { auth, passwordReset } = useDictionary();
  return (
    <AuthShell eyebrow={auth.actors[actor].name} title={passwordReset.forgot.title} description={passwordReset.forgot.body} footer={<BackToSignIn actor={actor} />}>
      <ForgotPasswordForm actor={actor} />
    </AuthShell>
  );
}

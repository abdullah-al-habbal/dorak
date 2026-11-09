"use client";

import { useEffect } from "react";
import type { JSX } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { BackToSignIn } from "@/components/auth/back-to-sign-in";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import type { AuthActor } from "@/enums/auth-actor.enum";
import { useDictionary } from "@/hooks/use-dictionary";

interface ResetPasswordScreenProps {
  actor: AuthActor;
  email: string;
  token: string;
}

export function ResetPasswordScreen({ actor, email, token }: ResetPasswordScreenProps): JSX.Element {
  const { auth, passwordReset } = useDictionary();

  // The token and email stay in memory only: drop them from the address bar and browser history.
  useEffect(() => {
    window.history.replaceState(window.history.state, "", window.location.pathname);
  }, []);

  return (
    <AuthShell eyebrow={auth.actors[actor].name} title={passwordReset.reset.title} description={passwordReset.reset.body} footer={<BackToSignIn actor={actor} />}>
      <ResetPasswordForm actor={actor} email={email} token={token} />
    </AuthShell>
  );
}

"use client";

import { CheckCircle2Icon } from "lucide-react";
import Link from "next/link";
import type { JSX } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { ROUTE_ROOT } from "@/config/routes.constant";
import type { AuthActor } from "@/enums/auth-actor.enum";
import { useDictionary } from "@/hooks/use-dictionary";

interface LoginScreenProps {
  actor: AuthActor;
  callbackUrl?: string;
  /** True right after a password reset, so the page confirms it. */
  resetDone?: boolean;
}

export function LoginScreen({ actor, callbackUrl, resetDone }: LoginScreenProps): JSX.Element {
  const { auth, passwordReset } = useDictionary();
  const persona = auth.actors[actor];

  return (
    <AuthShell
      eyebrow={persona.name}
      title={auth.signInTitle}
      description={persona.blurb}
      footer={
        <p>
          {auth.switchWorkspace}{" "}
          <Link href={ROUTE_ROOT} className="font-medium text-foreground underline-offset-4 hover:underline">
            {auth.guardPickerTitle}
          </Link>
        </p>
      }
    >
      {resetDone ? (
        <p role="status" className="mb-5 flex items-start gap-2.5 rounded-lg bg-success/10 px-3.5 py-3 text-sm text-success">
          <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{passwordReset.doneNotice}</span>
        </p>
      ) : null}
      <LoginForm actor={actor} callbackUrl={callbackUrl} />
    </AuthShell>
  );
}

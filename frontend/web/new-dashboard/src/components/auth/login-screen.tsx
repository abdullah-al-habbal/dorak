"use client";

import Link from "next/link";

import { BrandPanel } from "@/components/auth/brand-panel";
import { LoginForm } from "@/components/auth/login-form";
import { LanguageToggle } from "@/components/buttons/language-toggle";
import { ThemeToggle } from "@/components/buttons/theme-toggle";
import { ROUTE_ROOT } from "@/config/routes.constant";
import type { AuthActor } from "@/enums/auth-actor.enum";
import { useDictionary } from "@/hooks/use-dictionary";

interface LoginScreenProps {
  actor: AuthActor;
  callbackUrl?: string;
}

export function LoginScreen({ actor, callbackUrl }: LoginScreenProps) {
  const { common, auth } = useDictionary();
  const persona = auth.actors[actor];

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <main id="main" className="relative flex flex-col px-5 py-6 sm:px-10">
        <header className="flex items-center justify-between">
          <span translate="no" className="font-heading text-lg font-semibold lg:invisible">{common.appName}</span>
          <div className="flex items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <p className="text-sm font-medium text-primary">{persona.name}</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold">{auth.signInTitle}</h1>
          <p className="mt-2 mb-8 text-muted-foreground">{persona.blurb}</p>
          <LoginForm actor={actor} callbackUrl={callbackUrl} />
          <p className="mt-8 text-sm text-muted-foreground">
            {auth.switchWorkspace}{" "}
            <Link href={ROUTE_ROOT} className="font-medium text-foreground underline-offset-4 hover:underline">
              {auth.guardPickerTitle}
            </Link>
          </p>
        </div>
      </main>
      <BrandPanel />
    </div>
  );
}

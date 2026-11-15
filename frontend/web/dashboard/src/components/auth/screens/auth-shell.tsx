"use client";

import type { JSX, ReactNode } from "react";

import { BrandPanel } from "@/components/auth/screens/brand-panel";
import { LanguageToggle } from "@/components/buttons/language-toggle";
import { ThemeToggle } from "@/components/buttons/theme-toggle";
import { useDictionary } from "@/hooks/core/state/use-dictionary";

interface AuthShellProps {
  /** The workspace the page belongs to, shown above the title. */
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** The signed-out frame shared by sign-in, forgot-password and reset-password: form column and brand panel. */
export function AuthShell({ eyebrow, title, description, children, footer }: AuthShellProps): JSX.Element {
  const { common } = useDictionary();

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
          <p className="text-sm font-medium text-primary">{eyebrow}</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold text-balance">{title}</h1>
          <p className="mt-2 mb-8 text-muted-foreground text-pretty">{description}</p>
          {children}
          {footer ? <div className="mt-8 text-sm text-muted-foreground">{footer}</div> : null}
        </div>
      </main>
      <BrandPanel />
    </div>
  );
}

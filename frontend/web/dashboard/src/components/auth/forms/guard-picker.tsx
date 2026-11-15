"use client";

import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

import { LanguageToggle } from "@/components/buttons/language-toggle";
import { ThemeToggle } from "@/components/buttons/theme-toggle";
import { AUTH_ACTORS } from "@/config/auth-actors.constant";
import { loginRoute } from "@/config/routes.constant";
import { useDictionary } from "@/hooks/core/state/use-dictionary";

export function GuardPicker() {
  const { common, auth } = useDictionary();

  return (
    <main id="main" className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-5 py-6 sm:px-10">
      <header className="flex items-center justify-between">
        <span translate="no" className="font-heading text-lg font-semibold">{common.appName}</span>
        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>
      <div className="flex flex-1 flex-col justify-center py-12">
        <h1 className="font-heading text-3xl font-semibold">{auth.guardPickerTitle}</h1>
        <p className="mt-2 text-muted-foreground">{auth.guardPickerSubtitle}</p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {AUTH_ACTORS.map((actor) => (
            <li key={actor}>
              <Link
                href={loginRoute(actor)}
                className="group flex h-full flex-col gap-1.5 rounded-2xl bg-card p-5 shadow-lift transition-[box-shadow,transform] duration-150 ease-out-strong hover:shadow-float focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:scale-[0.99]"
              >
                <span className="flex items-center justify-between font-heading text-lg font-medium">
                  {auth.actors[actor].name}
                  <ArrowUpRightIcon className="size-4 text-muted-foreground transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" aria-hidden />
                </span>
                <span className="text-sm text-muted-foreground">{auth.actors[actor].blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

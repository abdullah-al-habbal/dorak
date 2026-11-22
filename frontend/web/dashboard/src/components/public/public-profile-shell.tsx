import type { JSX, ReactNode } from "react";

import { LanguageToggle } from "@/components/buttons/language-toggle";
import { ThemeToggle } from "@/components/buttons/theme-toggle";
import type { Dictionary } from "@/types/core/shared/dictionary.type";

/** The frame of every public profile: brand name and the language and theme switches, then the page. */
export function PublicProfileShell({ dictionary, children }: { dictionary: Dictionary; children: ReactNode }): JSX.Element {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4">
        <span translate="no" className="font-heading text-lg font-semibold">{dictionary.publicProfile.brand}</span>
        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>
      <main id="main" className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 pb-12">{children}</main>
    </div>
  );
}

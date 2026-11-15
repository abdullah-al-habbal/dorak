"use client";

import type { ReactNode } from "react";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import type { AuthActor } from "@/enums/auth-actor.enum";
import { useDictionary } from "@/hooks/use-dictionary";
import type { MeProfile } from "@/types/account/me-profile.type";

export function PortalShell({ actor, profile, children }: { actor: AuthActor; profile: MeProfile; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <SkipLink />
      <Sidebar actor={actor} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header actor={actor} profile={profile} />
        <main id="main" className="mx-auto w-full max-w-[1760px] flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function SkipLink() {
  const { common } = useDictionary();
  return (
    <a
      href="#main"
      className="sr-only z-50 rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
    >
      {common.skipToContent}
    </a>
  );
}

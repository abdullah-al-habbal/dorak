"use client";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NotificationsMenu } from "@/components/layout/notifications/notifications-menu";
import { UserMenu } from "@/components/layout/user-menu";
import { LanguageToggle } from "@/components/buttons/language-toggle";
import { ThemeToggle } from "@/components/buttons/theme-toggle";
import type { AuthActor } from "@/enums/access/auth-actor.enum";
import type { MeProfile } from "@/types/account/profile/me-profile.type";

export function Header({ actor, profile }: { actor: AuthActor; profile: MeProfile }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur-md sm:px-6">
      <MobileNav actor={actor} />
      <div className="min-w-0 flex-1">
        <Breadcrumbs actor={actor} />
      </div>
      <div className="flex items-center gap-0.5">
        <LanguageToggle />
        <ThemeToggle />
        <NotificationsMenu actor={actor} />
        <UserMenu actor={actor} initialProfile={profile} />
      </div>
    </header>
  );
}

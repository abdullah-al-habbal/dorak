"use client";

import { LogOutIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AuthActor } from "@/enums/auth-actor.enum";
import { useDictionary } from "@/hooks/use-dictionary";
import { useSignOut } from "@/hooks/use-sign-out";
import { initialsOf } from "@/lib/initials.util";
import { useAuthStore } from "@/store/auth.store";
import type { MeProfile } from "@/types/me-profile.type";

export function UserMenu({ actor, initialProfile }: { actor: AuthActor; initialProfile: MeProfile }) {
  const { shell, auth } = useDictionary();
  const profile = useAuthStore((state) => state.profile) ?? initialProfile;
  const { signOut, pending } = useSignOut(actor);
  const name = profile.display_name ?? profile.email ?? auth.actors[actor].name;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={shell.profile.menu}
        className="flex h-10 items-center gap-2 rounded-full ps-1 pe-1 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/40 sm:pe-3"
      >
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{initialsOf(name)}</AvatarFallback>
        </Avatar>
        <span className="hidden max-w-32 truncate text-sm font-medium sm:block">{name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-60">
        <div className="px-2 py-2">
          <p className="text-xs text-subtle-foreground">{shell.profile.signedInAs}</p>
          <p className="truncate text-sm font-medium">{name}</p>
          {profile.email && profile.email !== name ? <p className="truncate text-xs text-muted-foreground">{profile.email}</p> : null}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" disabled={pending} onClick={signOut}>
          <LogOutIcon aria-hidden />
          {pending ? auth.signingOut : auth.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

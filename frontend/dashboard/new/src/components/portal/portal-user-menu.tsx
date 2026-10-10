"use client";

import { Avatar, AvatarFallback } from "@/components/tailgrids/core/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/tailgrids/core/dropdown";
import { portalProfileFor } from "@/config/routes.util";
import { useDictionary } from "@/hooks/use-dictionary";
import { useSession } from "@/hooks/use-session";
import { useSignOut } from "@/hooks/use-sign-out";

function initials(value: string | null): string {
  return value?.trim().slice(0, 1) || "A";
}

export function PortalUserMenu() {
  const dictionary = useDictionary();
  const session = useSession();
  const signOut = useSignOut(session.actor);
  const name = session.displayName ?? dictionary.common.userMenu.fallbackName;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label={dictionary.common.userMenu.accountSettings}>
        <Avatar size="sm">
          <AvatarFallback>{initials(name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent placement="bottom end" className="min-w-56">
        <DropdownMenuHeader>
          <p className="truncate font-medium text-text-primary">{name}</p>
          {session.email ? <p className="truncate text-xs text-text-tertiary">{session.email}</p> : null}
        </DropdownMenuHeader>
        <DropdownMenuSeparator />
        <DropdownMenuItem href={portalProfileFor(session.actor).account}>
          {dictionary.common.userMenu.viewProfile}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onAction={signOut.signOut}>
          {dictionary.common.userMenu.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import type { JSX } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavQueueCount } from "@/components/layout/nav-queue-count";
import { NAV_ITEMS } from "@/config/money-shell/nav.constant";
import { portalRoot } from "@/config/routes.constant";
import type { AuthActor } from "@/enums/access/auth-actor.enum";
import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  actor: AuthActor;
  collapsed: boolean;
  onNavigate?: () => void;
}

export function SidebarNav({ actor, collapsed, onNavigate }: SidebarNavProps): JSX.Element {
  const { shell } = useDictionary();
  const pathname = usePathname();
  const root = portalRoot(actor);

  return (
    <nav aria-label={shell.primaryNav} className="flex flex-col gap-0.5">
      {NAV_ITEMS[actor].map((item) => {
        const href = item.segment ? `${root}/${item.segment}` : root;
        const active = item.segment ? pathname.startsWith(href) : pathname === root;
        const label = shell.nav[item.key];
        const Icon = item.icon;
        const base = cn(
          "relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150",
          collapsed && "justify-center px-0",
        );

        if (!item.ready) {
          return (
            <span key={item.key} aria-disabled="true" title={collapsed ? label : undefined} className={cn(base, "cursor-not-allowed text-subtle-foreground/70")}>
              <Icon className="size-[18px] shrink-0" aria-hidden />
              {collapsed ? <span className="sr-only">{label}</span> : <span className="flex-1 truncate">{label}</span>}
              {collapsed ? null : <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-subtle-foreground">{shell.soon}</span>}
            </span>
          );
        }
        return (
          <Link
            key={item.key}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            title={collapsed ? label : undefined}
            className={cn(
              base,
              "outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
              active ? "bg-sidebar-accent text-foreground" : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
            )}
          >
            {active ? <span aria-hidden className="pole-stripe absolute inset-y-2 start-0 w-[3px] rounded-full" /> : null}
            <Icon className="size-[18px] shrink-0" aria-hidden />
            {collapsed ? <span className="sr-only">{label}</span> : <span className="truncate">{label}</span>}
            {collapsed ? null : <NavQueueCount itemKey={item.key} />}
          </Link>
        );
      })}
    </nav>
  );
}

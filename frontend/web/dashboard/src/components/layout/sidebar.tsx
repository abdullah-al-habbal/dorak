"use client";

import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Button } from "@/components/ui/button";
import type { AuthActor } from "@/enums/access/auth-actor.enum";
import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { useSidebar } from "@/hooks/core/state/use-sidebar";
import { cn } from "@/lib/utils";

export function Sidebar({ actor }: { actor: AuthActor }) {
  const { common, shell, auth } = useDictionary();
  const { collapsed, setCollapsed } = useSidebar();

  return (
    <aside
      aria-label={common.appName}
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-e border-sidebar-border bg-sidebar transition-[width] duration-200 ease-out-strong md:flex",
        collapsed ? "w-[68px]" : "w-[264px]",
      )}
    >
      <div className={cn("flex h-16 items-center gap-2 px-4", collapsed && "justify-center px-0")}>
        <span aria-hidden className="pole-stripe size-7 shrink-0 rounded-full shadow-lift" />
        {collapsed ? null : (
          <div className="min-w-0">
            <p translate="no" className="font-heading text-base leading-tight font-semibold">{common.appName}</p>
            <p className="truncate text-xs text-subtle-foreground">{auth.actors[actor].name}</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        <SidebarNav actor={actor} collapsed={collapsed} />
      </div>

      <div className={cn("flex border-t border-sidebar-border p-3", collapsed && "justify-center")}>
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          className="text-muted-foreground"
          aria-label={collapsed ? shell.expandSidebar : shell.collapseSidebar}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <PanelLeftOpenIcon className="rtl:-scale-x-100" aria-hidden /> : <PanelLeftCloseIcon className="rtl:-scale-x-100" aria-hidden />}
          {collapsed ? null : shell.collapseSidebar}
        </Button>
      </div>
    </aside>
  );
}

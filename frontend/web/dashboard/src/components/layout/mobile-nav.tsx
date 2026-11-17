"use client";

import type { JSX } from "react";
import { MenuIcon } from "lucide-react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { TextDirection } from "@/enums/access/text-direction.enum";
import type { AuthActor } from "@/enums/access/auth-actor.enum";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useSidebar } from "@/hooks/core/state/use-sidebar";

export function MobileNav({ actor }: { actor: AuthActor }): JSX.Element {
  const { dictionary, direction } = useI18n();
  const { mobileOpen: open, setMobileOpen: setOpen } = useSidebar();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" aria-label={dictionary.shell.openMenu} />}>
        <MenuIcon aria-hidden />
      </SheetTrigger>
      <SheetContent side={direction === TextDirection.Rtl ? "right" : "left"} className="w-72 max-w-[85vw]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span aria-hidden className="pole-stripe size-6 rounded-full" />
            {dictionary.common.appName}
          </SheetTitle>
        </SheetHeader>
        <div className="px-3">
          <SidebarNav actor={actor} collapsed={false} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

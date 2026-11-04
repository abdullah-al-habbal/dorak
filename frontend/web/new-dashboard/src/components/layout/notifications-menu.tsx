"use client";

import { BellIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDictionary } from "@/hooks/use-dictionary";

/** Typed empty state until the notifications proxy is allow-listed. */
export function NotificationsMenu() {
  const { shell } = useDictionary();

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="ghost" size="icon" aria-label={shell.notifications.title} />}>
        <BellIcon aria-hidden />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 gap-0 p-0">
        <div className="border-b px-4 py-3 text-sm font-medium">{shell.notifications.title}</div>
        <div className="flex flex-col items-center gap-1 px-6 py-10 text-center">
          <span className="mb-2 grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
            <BellIcon className="size-5" aria-hidden />
          </span>
          <p className="text-sm font-medium">{shell.notifications.empty}</p>
          <p className="text-sm text-muted-foreground">{shell.notifications.emptyHint}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

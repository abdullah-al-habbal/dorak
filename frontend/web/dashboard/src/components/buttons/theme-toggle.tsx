"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeMode } from "@/enums/ui/theme-mode.enum";
import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { themeModeSchema } from "@/schemas/core/api/theme-mode.zod";
import { useThemeStore } from "@/store/theme.store";

export function ThemeToggle() {
  const { common } = useDictionary();
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label={common.theme.label} />}>
        <SunIcon className="dark:hidden" aria-hidden />
        <MoonIcon className="hidden dark:block" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuRadioGroup
          value={mode}
          onValueChange={(value) => {
            const next = themeModeSchema.safeParse(value);
            if (next.success) setMode(next.data);
          }}
        >
          <DropdownMenuRadioItem value={ThemeMode.Light}><SunIcon aria-hidden />{common.theme.light}</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value={ThemeMode.Dark}><MoonIcon aria-hidden />{common.theme.dark}</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value={ThemeMode.System}><MonitorIcon aria-hidden />{common.theme.system}</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

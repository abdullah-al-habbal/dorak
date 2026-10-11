"use client";

import { HeaderControlButton } from "@/components/common/header/header-control-button";
import { MoonIcon, SunIcon } from "@/components/common/header/icons";
import { useThemeToggle } from "@/hooks/use-theme-toggle";

export function ThemeToggle() {
  const themeToggle = useThemeToggle();

  return (
    <HeaderControlButton
      ariaLabel={themeToggle.ariaLabel}
      onPress={themeToggle.toggleTheme}
      className="[&>svg]:size-auto"
    >
      {themeToggle.isDark ? <SunIcon /> : <MoonIcon />}
    </HeaderControlButton>
  );
}

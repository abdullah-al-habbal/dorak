"use client";

import { useDictionary } from "@/hooks/use-dictionary";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribeNoop = () => () => {};

/**
 * The server cannot know the stored theme, so the first client render must match
 * the server's light default; the real theme applies after hydration.
 */
export function useThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const copy = useDictionary().common.theme;
  const hydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const isDark = hydrated && resolvedTheme === "dark";

  return {
    isDark,
    ariaLabel: isDark ? copy.switchToLight : copy.switchToDark,
    toggleTheme: () => setTheme(isDark ? "light" : "dark"),
  };
}

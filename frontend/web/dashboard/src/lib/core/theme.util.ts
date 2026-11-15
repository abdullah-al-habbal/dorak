import { DARK_CLASS, THEME_TRANSITION_CLASS, THEME_TRANSITION_MS } from "@/config/theme.constant";
import { ThemeMode } from "@/enums/theme-mode.enum";

export function resolvesToDark(mode: ThemeMode, prefersDark: boolean): boolean {
  return mode === ThemeMode.Dark || (mode === ThemeMode.System && prefersDark);
}

export function applyTheme(mode: ThemeMode, animate: boolean): void {
  const root = document.documentElement;
  const dark = resolvesToDark(mode, matchMedia("(prefers-color-scheme: dark)").matches);
  if (animate) {
    root.classList.add(THEME_TRANSITION_CLASS);
    window.setTimeout(() => root.classList.remove(THEME_TRANSITION_CLASS), THEME_TRANSITION_MS);
  }
  root.classList.toggle(DARK_CLASS, dark);
  root.style.colorScheme = dark ? "dark" : "light";
}

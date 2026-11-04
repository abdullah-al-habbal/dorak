import { create } from "zustand";

import { THEME_COOKIE } from "@/config/cookies.constant";
import { ThemeMode } from "@/enums/theme-mode.enum";
import type { ThemeState } from "@/interfaces/theme-state.interface";
import { readClientCookie, writeClientCookie } from "@/lib/cookie.util";
import { applyTheme } from "@/lib/theme.util";
import { themeModeSchema } from "@/schemas/theme-mode.zod";

export const useThemeStore = create<ThemeState>((set) => ({
  mode: ThemeMode.System,
  hydrated: false,
  hydrate: () => {
    const saved = themeModeSchema.safeParse(readClientCookie(THEME_COOKIE));
    set({ mode: saved.success ? saved.data : ThemeMode.System, hydrated: true });
  },
  setMode: (mode) => {
    writeClientCookie(THEME_COOKIE, mode);
    applyTheme(mode, true);
    set({ mode });
  },
}));

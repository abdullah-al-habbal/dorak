import { create } from "zustand";

import { THEME_COOKIE } from "@/config/cookies.constant";
import { ThemeMode } from "@/enums/ui/theme-mode.enum";
import type { ThemeState } from "@/interfaces/ui/shell/theme-state.interface";
import { readClientCookie, writeClientCookie } from "@/lib/core/errors/cookie.util";
import { applyTheme } from "@/lib/core/errors/theme.util";
import { themeModeSchema } from "@/schemas/core/api/theme-mode.zod";

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

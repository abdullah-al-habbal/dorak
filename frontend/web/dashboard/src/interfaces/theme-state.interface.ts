import type { ThemeMode } from "@/enums/theme-mode.enum";

export interface ThemeState {
  mode: ThemeMode;
  hydrated: boolean;
  hydrate: () => void;
  setMode: (mode: ThemeMode) => void;
}

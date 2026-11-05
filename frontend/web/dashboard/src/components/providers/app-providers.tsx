"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createQueryClient } from "@/lib/query-client";
import { applyTheme } from "@/lib/theme.util";
import { useThemeStore } from "@/store/theme.store";
import { ThemeMode } from "@/enums/theme-mode.enum";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  const hydrate = useThemeStore((state) => state.hydrate);
  const mode = useThemeStore((state) => state.mode);

  useEffect(() => hydrate(), [hydrate]);

  useEffect(() => {
    if (mode !== ThemeMode.System) return;
    const query = matchMedia("(prefers-color-scheme: dark)");
    const sync = () => applyTheme(ThemeMode.System, false);
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [mode]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delay={250}>{children}</TooltipProvider>
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}

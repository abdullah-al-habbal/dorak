"use client";

import type { Dictionary } from "@/i18n/dictionary.types";
import { AppI18nProvider } from "@/i18n/i18n-provider";
import type { Direction, Locale } from "@/i18n/locales.types";
import { createQueryClient } from "@/services/api/query-client";
import { NetworkHealthBanner } from "@/components/network/network-health-banner";
import { NetworkHealthProvider } from "@/components/network/network-health-provider";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

interface ProvidersProps {
  locale: Locale;
  dir: Direction;
  dictionary: Dictionary;
  children: React.ReactNode;
}

export default function Providers({
  locale,
  dir,
  dictionary,
  children,
}: ProvidersProps) {
  // The client lives for the whole session; it reads the latest dictionary
  // through this closure so error toasts follow locale switches.
  const [{ queryClient, syncDictionary }] = useState(() => {
    let current = dictionary;
    return {
      queryClient: createQueryClient(() => current),
      syncDictionary: (next: Dictionary) => {
        current = next;
      },
    };
  });

  useEffect(() => syncDictionary(dictionary), [dictionary, syncDictionary]);

  return (
    <ThemeProvider defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <AppI18nProvider locale={locale} dir={dir} dictionary={dictionary}>
          <NetworkHealthProvider>
            <NetworkHealthBanner />
            {children}
          </NetworkHealthProvider>
          <Toaster />
        </AppI18nProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

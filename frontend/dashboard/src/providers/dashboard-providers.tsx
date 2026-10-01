'use client';

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { ThemeProvider } from 'next-themes';
import { DashboardApiError, isDashboardApiError } from '@/shared/api/dashboard-api-error';
import { dashboardApiErrorEvent } from '@/shared/api/error-events';
import { showError } from '@/shared/components/feedback/toast';
import { ChairConflictDialog } from '@/features/chairs/components/dialogs/chair-conflict-dialog';

const defaultStaleTimeMs = 30_000;

export function DashboardProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: (attempt, error) => !(error instanceof DashboardApiError && error.status < 500) && attempt < 2,
        staleTime: defaultStaleTimeMs,
      },
    },
    queryCache: new QueryCache({
      onError: (error) => showUnexpectedError(error),
    }),
    mutationCache: new MutationCache({
      onError: (error) => showUnexpectedError(error),
    }),
  }));

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<DashboardApiError>).detail;
      showApiError(detail);
    };
    window.addEventListener(dashboardApiErrorEvent, listener);
    return () => window.removeEventListener(dashboardApiErrorEvent, listener);
  }, []);

  return <ThemeProvider attribute="class" defaultTheme="system" enableSystem><QueryClientProvider client={queryClient}>{children}<ChairConflictDialog /><Toaster richColors /></QueryClientProvider></ThemeProvider>;
}

function showApiError(error: DashboardApiError): void {
  toast.error(error.message);
}

function showUnexpectedError(error: unknown): void {
  if (isDashboardApiError(error)) return;
  showError('An unexpected error occurred.');
}

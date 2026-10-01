'use client';

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { registerApiErrorHandler } from '@/shared/api/error-interceptor';
import { DashboardApiError, isDashboardApiError } from '@/shared/api/dashboard-api-error';
import { dashboardClaimCookieName } from '@/shared/auth/dashboard-claim';
import { APP_ROUTES } from '@/shared/routes/dashboard-routes';

const defaultStaleTimeMs = 30_000;

export function QueryProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: (attempt, error) => !(error instanceof DashboardApiError && error.status < 500) && attempt < 2, staleTime: defaultStaleTimeMs, throwOnError: true } }, queryCache: new QueryCache({ onError: showUnexpectedError }), mutationCache: new MutationCache({ onError: showUnexpectedError }) }));

  useEffect(() => registerApiErrorHandler(handleTransportError), []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function handleTransportError(error: DashboardApiError): void {
  if (error.status === 401) {
    document.cookie = `${dashboardClaimCookieName}=; Path=/; Max-Age=0; SameSite=Lax`;
    window.location.assign(APP_ROUTES.login);
    return;
  }
  toast.error(error.message);
}

function showUnexpectedError(error: unknown): void { if (!isDashboardApiError(error)) toast.error('An unexpected error occurred.'); }

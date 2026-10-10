'use client';

import { ModalProvider } from '@/providers/modal-provider';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { ToastProvider } from '@/providers/toast-provider';
import { ErrorBoundary } from '@/shared/components/feedback/error-boundary';

export function DashboardProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <ErrorBoundary>{children}</ErrorBoundary>
        <ModalProvider />
        <ToastProvider />
      </QueryProvider>
    </ThemeProvider>
  );
}

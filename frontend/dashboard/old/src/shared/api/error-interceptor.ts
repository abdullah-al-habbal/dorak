import type { DashboardApiError } from '@/shared/api/dashboard-api-error';
import type { ApiErrorHandler } from '@/shared/api/types/api-error-handler.type';

let errorHandler: ApiErrorHandler | undefined;

export function registerApiErrorHandler(handler: ApiErrorHandler): () => void {
  errorHandler = handler;
  return () => {
    if (errorHandler === handler) {
      errorHandler = undefined;
    }
  };
}

export function interceptApiError(error: DashboardApiError): void {
  errorHandler?.(error);
}

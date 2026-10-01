import type { ApiErrorPayload } from '@/shared/types/api';

export class DashboardApiError extends Error {
  public readonly details: Record<string, string[]>;

  public readonly requestId?: string | undefined;

  public constructor(
    public readonly status: number,
    payload: ApiErrorPayload = {},
  ) {
    super(payload.message ?? defaultMessageForStatus(status));
    this.name = 'DashboardApiError';
    this.details = payload.errors ?? {};
    this.requestId = payload.request_id;
  }
}

export function isDashboardApiError(error: unknown): error is DashboardApiError {
  return error instanceof DashboardApiError;
}

function defaultMessageForStatus(status: number): string {
  if (status === 401) {
    return 'Your session has expired. Please sign in again.';
  }
  if (status === 403) {
    return 'You do not have permission to perform this action.';
  }
  if (status === 409) {
    return 'This record changed. Refresh and try again.';
  }
  if (status === 422) {
    return 'Please correct the highlighted fields.';
  }
  if (status >= 500) {
    return 'The service is temporarily unavailable. Please try again.';
  }
  return 'The request could not be completed.';
}

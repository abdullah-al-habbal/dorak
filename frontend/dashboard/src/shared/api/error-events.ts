import { DashboardApiError } from '@/shared/api/dashboard-api-error';

export const dashboardApiErrorEvent = 'dorak:dashboard-api-error';

export function publishDashboardApiError(error: DashboardApiError): void {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new CustomEvent<DashboardApiError>(dashboardApiErrorEvent, { detail: error }));
}

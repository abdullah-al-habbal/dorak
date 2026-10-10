import type { DashboardApiError } from '@/shared/api/dashboard-api-error';

export type ApiErrorHandler = (error: DashboardApiError) => void;

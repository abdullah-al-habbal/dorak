import { useMutation } from '@tanstack/react-query';
import { dashboardLogin } from '@/features/auth/api/dashboard-login';

export function useDashboardLogin() {
  return useMutation({ mutationFn: dashboardLogin });
}

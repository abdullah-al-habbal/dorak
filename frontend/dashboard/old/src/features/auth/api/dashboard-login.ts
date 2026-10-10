import type { DashboardLoginInput } from '@/features/auth/types/dashboard-login-input.type';
import type { DashboardLoginResult } from '@/features/auth/types/dashboard-login-result.type';

export async function dashboardLogin(input: DashboardLoginInput): Promise<DashboardLoginResult> {
  const response = await fetch('/api/auth/login', {
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });
  const payload = (await response.json().catch(() => null)) as {
    readonly message?: string;
    readonly redirectPath?: string;
  } | null;
  if (!response.ok || typeof payload?.redirectPath !== 'string') {
    throw new Error(payload?.message ?? 'Unable to sign in.');
  }

  return { redirectPath: payload.redirectPath };
}

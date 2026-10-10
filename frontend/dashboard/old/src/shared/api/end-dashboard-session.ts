export async function endDashboardSession(): Promise<void> {
  await fetch('/api/auth/session', { method: 'DELETE' });
}

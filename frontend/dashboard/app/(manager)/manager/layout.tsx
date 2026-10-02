import { notFound } from 'next/navigation';
import { canAccessArea, managerArea } from '@/shared/auth';
import { resolveRequestClaim } from '@/shared/auth/resolve-request-claim';
import { DashboardShell } from '@/shared/components/layout/dashboard-shell';

export default async function ManagerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const claim = await resolveRequestClaim();
  if (claim === null || !canAccessArea(claim, managerArea)) {
    notFound();
  }

  return <DashboardShell claim={claim}>{children}</DashboardShell>;
}

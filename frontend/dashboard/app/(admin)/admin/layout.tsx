import { notFound } from 'next/navigation';
import { adminArea, canAccessArea } from '@/shared/auth';
import { resolveRequestClaim } from '@/shared/auth/resolve-request-claim';
import { DashboardShell } from '@/shared/components/layout/dashboard-shell';

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const claim = await resolveRequestClaim();
  if (claim === null || !canAccessArea(claim, adminArea)) {
    notFound();
  }

  return <DashboardShell claim={claim}>{children}</DashboardShell>;
}

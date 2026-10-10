import { notFound } from 'next/navigation';
import { canAccessArea, isDashboardArea } from '@/shared/auth';
import { resolveRequestClaim } from '@/shared/auth/resolve-request-claim';
import { DashboardShell } from '@/shared/components/layout/dashboard-shell';

export default async function DashboardAreaLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ area: string }> }>) {
  const { area } = await params;
  const claim = await resolveRequestClaim();
  if (!isDashboardArea(area) || claim === null || !canAccessArea(claim, area)) {
    notFound();
  }

  return <DashboardShell claim={claim}>{children}</DashboardShell>;
}

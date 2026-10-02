import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { canAccessArea, dashboardClaimCookieName, isDashboardArea } from '@/shared/auth';
import { verifyDashboardClaim } from '@/shared/auth/verify-dashboard-claim';
import { DashboardShell } from '@/shared/components/layout/dashboard-shell';

export default async function DashboardAreaLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ area: string }> }>) {
  const { area } = await params;
  const claim = await verifyDashboardClaim((await cookies()).get(dashboardClaimCookieName)?.value);
  if (!isDashboardArea(area) || claim === null || !canAccessArea(claim, area)) {
    notFound();
  }

  return <DashboardShell claim={claim}>{children}</DashboardShell>;
}

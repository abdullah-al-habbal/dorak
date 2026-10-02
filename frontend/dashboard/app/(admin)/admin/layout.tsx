import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { adminArea, canAccessArea, dashboardClaimCookieName } from '@/shared/auth';
import { verifyDashboardClaim } from '@/shared/auth/verify-dashboard-claim';
import { DashboardShell } from '@/shared/components/layout/dashboard-shell';

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const claim = await verifyDashboardClaim((await cookies()).get(dashboardClaimCookieName)?.value);
  if (claim === null || !canAccessArea(claim, adminArea)) {
    notFound();
  }

  return <DashboardShell claim={claim}>{children}</DashboardShell>;
}

import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { canAccessArea, dashboardClaimCookieName, managerArea } from '@/shared/auth';
import { verifyDashboardClaim } from '@/shared/auth/verify-dashboard-claim';
import { DashboardShell } from '@/shared/components/layout/dashboard-shell';

export default async function ManagerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const claim = await verifyDashboardClaim((await cookies()).get(dashboardClaimCookieName)?.value);
  if (claim === null || !canAccessArea(claim, managerArea)) {
    notFound();
  }

  return <DashboardShell claim={claim}>{children}</DashboardShell>;
}

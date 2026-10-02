import Link from 'next/link';
import { checkBackendHealth } from '@/shared/api/check-backend-health';
import { homePathForClaim } from '@/shared/auth';
import { getDashboardClaim } from '@/shared/auth/get-dashboard-claim';
import { APP_ROUTES } from '@/shared/routes/dashboard-routes';

export default async function Home() {
  const [claim, backendHealth] = await Promise.all([getDashboardClaim(), checkBackendHealth()]);
  const backendIsOnline = backendHealth === 'online';
  const actionHref = claim === null ? APP_ROUTES.login : homePathForClaim(claim);
  const actionLabel = claim === null ? 'Sign in to your dashboard' : 'Open your dashboard';

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-8 p-6 sm:p-10">
      <section className="space-y-5">
        <p className="text-sm font-medium text-primary">Dorak Dashboard</p>
        <div className="max-w-2xl space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Run your salon with confidence.
          </h1>
          <p className="text-lg text-foreground/75">
            A focused portal for managing bookings, teams, services, and branches.
          </p>
        </div>
      </section>

      <section aria-labelledby="backend-status" className="rounded-lg border bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 id="backend-status" className="font-medium">
              Backend status
            </h2>
            <p className="text-sm text-foreground/75">
              {backendIsOnline
                ? 'Connected to the Dorak service.'
                : 'The Dorak service cannot be reached right now.'}
            </p>
          </div>
          <span
            className={
              backendIsOnline
                ? 'rounded-lg bg-primary px-3 py-1 text-sm font-medium text-background'
                : 'rounded-lg bg-destructive px-3 py-1 text-sm font-medium text-background'
            }
          >
            {backendIsOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {!backendIsOnline ? (
          <p
            className="mt-4 rounded-lg border border-destructive p-3 text-sm text-destructive"
            role="alert"
          >
            Some dashboard data may be unavailable until the backend connection is restored.
          </p>
        ) : null}
      </section>

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-background hover:opacity-90"
          href={actionHref}
        >
          {actionLabel}
        </Link>
        <p className="text-sm text-foreground/75">
          {claim === null ? 'Use your dashboard account to continue.' : 'Your session is active.'}
        </p>
      </section>
    </main>
  );
}

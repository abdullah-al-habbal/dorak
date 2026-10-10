import { DashboardLoginForm } from '@/features/auth/components/forms/dashboard-login-form';

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Dorak Dashboard</p>
        <h1 className="text-3xl font-semibold">Sign in</h1>
        <p className="text-sm text-foreground/75">
          Authenticate with a platform administrator or branch-manager account.
        </p>
      </div>
      <DashboardLoginForm />
    </main>
  );
}

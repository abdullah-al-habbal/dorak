'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useDashboardLogin } from '@/features/auth/hooks/use-dashboard-login';
import { Button } from '@/shared/components/buttons/button';
import { Input } from '@/shared/components/forms/input';

const loginSchema = z.object({
  actorType: z.enum(['admin', 'branch']),
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function DashboardLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const login = useDashboardLogin();
  const form = useForm<LoginFormValues>({
    defaultValues: { actorType: 'admin', email: '', password: '' },
    resolver: zodResolver(loginSchema),
  });

  const submit = async (input: LoginFormValues) => {
    setError(null);
    try {
      const result = await login.mutateAsync(input);
      router.replace(result.redirectPath);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to sign in.');
    }
  };

  return (
    <form className="grid w-full max-w-md gap-4" onSubmit={form.handleSubmit(submit)}>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Account type</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" value="admin" {...form.register('actorType')} />
          Platform administrator
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" value="branch" {...form.register('actorType')} />
          Branch manager
        </label>
      </fieldset>
      <label className="grid gap-1 text-sm font-medium">
        Email
        <Input autoComplete="email" type="email" {...form.register('email')} />
        {form.formState.errors.email === undefined ? null : (
          <span className="text-destructive">{form.formState.errors.email.message}</span>
        )}
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Password
        <Input autoComplete="current-password" type="password" {...form.register('password')} />
        {form.formState.errors.password === undefined ? null : (
          <span className="text-destructive">{form.formState.errors.password.message}</span>
        )}
      </label>
      {error === null ? null : (
        <p
          className="rounded-lg border border-destructive p-3 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
      <Button disabled={form.formState.isSubmitting || login.isPending} type="submit">
        {form.formState.isSubmitting || login.isPending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  createBranchSchema,
  type CreateBranchInput,
  type UpdateBranchInput,
  updateBranchSchema,
} from '@/features/branches/schemas/branch.schema';
import type { BranchFormProps } from '@/features/branches/types/components';
import { Input } from '@/shared/components/forms/input';

export function BranchForm({
  defaultValues,
  formId,
  onSubmit,
  requiresPassword,
}: Readonly<BranchFormProps>) {
  const form = useForm<CreateBranchInput | UpdateBranchInput>({
    ...(defaultValues === undefined ? {} : { defaultValues }),
    resolver: zodResolver(requiresPassword ? createBranchSchema : updateBranchSchema),
  });

  return (
    <form className="grid gap-4 sm:grid-cols-2" id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <Input
        aria-label="English branch name"
        placeholder="English name"
        {...form.register('name.en')}
      />
      <Input
        aria-label="Arabic branch name"
        placeholder="Arabic name"
        {...form.register('name.ar')}
      />
      <Input aria-label="Brand ID" placeholder="Brand ID" {...form.register('brand_id')} />
      <Input
        aria-label="Branch email"
        placeholder="Email"
        type="email"
        {...form.register('email')}
      />
      <Input
        aria-label="Password"
        placeholder={requiresPassword ? 'Password' : 'New password (optional)'}
        type="password"
        {...form.register('password')}
      />
      <Input
        aria-label="Latitude"
        placeholder="Latitude"
        type="number"
        {...form.register('latitude', { valueAsNumber: true })}
      />
      <Input
        aria-label="Longitude"
        placeholder="Longitude"
        type="number"
        {...form.register('longitude', { valueAsNumber: true })}
      />
    </form>
  );
}

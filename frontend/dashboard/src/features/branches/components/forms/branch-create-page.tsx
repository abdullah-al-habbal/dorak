'use client';

import { useRouter } from 'next/navigation';
import { GenericCreatePage } from '@/shared/components/templates/generic-form-page';
import { BranchForm } from '@/features/branches/components/forms/branch-form';
import { useCreateBranch } from '@/features/branches/hooks/use-branches';
import type { CreateBranchInput } from '@/features/branches/schemas/branch.schema';
import { APP_ROUTES } from '@/shared/routes/dashboard-routes';

const formId = 'create-branch';

export function BranchCreatePage() {
  const router = useRouter();
  const mutation = useCreateBranch();
  return <GenericCreatePage cancelHref={APP_ROUTES.entity('admin', 'branches')} formId={formId} isPending={mutation.isPending} submitLabel="Create branch" title="Create branch"><BranchForm formId={formId} onSubmit={(input) => mutation.mutate(input as CreateBranchInput, { onSuccess: (branch) => router.push(APP_ROUTES.show('admin', 'branches', branch.id)) })} requiresPassword /></GenericCreatePage>;
}

'use client';

import { useRouter } from 'next/navigation';
import { GenericUpdatePage } from '@/shared/components/templates/generic-form-page';
import { BranchForm } from '@/features/branches/components/forms/branch-form';
import { useBranch, useUpdateBranch } from '@/features/branches/hooks/use-branches';
import type { UpdateBranchInput } from '@/features/branches/schemas/branch.schema';

const formId = 'update-branch';

export function BranchUpdatePage({ basePath, id }: Readonly<{ basePath: '/admin' | '/manager'; id: string }>) {
  const router = useRouter();
  const branch = useBranch(id);
  const mutation = useUpdateBranch();
  const values = branch.data === undefined ? undefined : { ...branch.data, latitude: branch.data.latitude === null ? undefined : Number(branch.data.latitude), longitude: branch.data.longitude === null ? undefined : Number(branch.data.longitude) };
  return <GenericUpdatePage cancelHref={`${basePath}/branches/${id}`} formId={formId} isLoading={branch.isLoading} isPending={mutation.isPending} submitLabel="Save changes" title="Update branch"><BranchForm defaultValues={values} formId={formId} onSubmit={(input) => mutation.mutate({ id, input: input as UpdateBranchInput }, { onSuccess: () => router.push(`${basePath}/branches/${id}`) })} requiresPassword={false} /></GenericUpdatePage>;
}

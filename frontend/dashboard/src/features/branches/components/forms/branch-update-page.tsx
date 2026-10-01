'use client';

import { useRouter } from 'next/navigation';
import { GenericUpdatePage } from '@/shared/components/templates/generic-form-page';
import { BranchForm } from '@/features/branches/components/forms/branch-form';
import { useBranch, useUpdateBranch } from '@/features/branches/hooks/use-branches';
import type { UpdateBranchInput } from '@/features/branches/schemas/branch.schema';
import { APP_ROUTES } from '@/shared/routes/dashboard-routes';
import type { BranchPageProps } from '@/features/branches/types/components';

const formId = 'update-branch';

export function BranchUpdatePage({ area, id }: Readonly<BranchPageProps>) {
  const router = useRouter();
  const branch = useBranch(id);
  const mutation = useUpdateBranch();
  const values = branch.data === undefined ? undefined : { ...branch.data, latitude: branch.data.latitude === null ? undefined : Number(branch.data.latitude), longitude: branch.data.longitude === null ? undefined : Number(branch.data.longitude) };
  return <GenericUpdatePage cancelHref={APP_ROUTES.show(area, 'branches', id)} formId={formId} isLoading={branch.isLoading} isPending={mutation.isPending} submitLabel="Save changes" title="Update branch"><BranchForm defaultValues={values} formId={formId} onSubmit={(input) => mutation.mutate({ id, input: input as UpdateBranchInput }, { onSuccess: () => router.push(APP_ROUTES.show(area, 'branches', id)) })} requiresPassword={false} /></GenericUpdatePage>;
}
